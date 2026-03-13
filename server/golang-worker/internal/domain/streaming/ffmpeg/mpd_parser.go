package ffmpeg

import (
	"encoding/xml"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// --- Structs định nghĩa cấu trúc MPD ---

type mpdRoot struct {
	XMLName                   xml.Name    `xml:"MPD"`
	MediaPresentationDuration string      `xml:"mediaPresentationDuration,attr"`
	Profiles                  string      `xml:"profiles,attr"`
	Type                      string      `xml:"type,attr"`
	Periods                   []mpdPeriod `xml:"Period"`
}

type mpdPeriod struct {
	AdaptationSets []mpdAdaptationSet `xml:"AdaptationSet"`
}

type mpdAdaptationSet struct {
	ID               string              `xml:"id,attr"`
	ContentType      string              `xml:"contentType,attr"`
	MimeType         string              `xml:"mimeType,attr"`
	MaxWidth         string              `xml:"maxWidth,attr"`
	MaxHeight        string              `xml:"maxHeight,attr"`
	Par              string              `xml:"par,attr"`
	FrameRate        string              `xml:"frameRate,attr"`
	SegmentAlignment string              `xml:"segmentAlignment,attr"`
	Representations  []mpdRepresentation `xml:"Representation"`
}

type mpdRepresentation struct {
	ID              string              `xml:"id,attr"`
	MimeType        string              `xml:"mimeType,attr"`
	Codecs          string              `xml:"codecs,attr"`
	Bandwidth       string              `xml:"bandwidth,attr"`
	Width           string              `xml:"width,attr"`
	Height          string              `xml:"height,attr"`
	Sar             string              `xml:"sar,attr"`
	SegmentTemplate *mpdSegmentTemplate `xml:"SegmentTemplate"`
}

type mpdSegmentTemplate struct {
	Timescale      int                 `xml:"timescale,attr"`
	Initialization string              `xml:"initialization,attr"`
	Media          string              `xml:"media,attr"`
	StartNumber    int                 `xml:"startNumber,attr"`
	Timeline       *mpdSegmentTimeline `xml:"SegmentTimeline"`
}

type mpdSegmentTimeline struct {
	Entries []mpdTimelineEntry `xml:"S"`
}

type mpdTimelineEntry struct {
	T int64 `xml:"t,attr,omitempty"`
	D int64 `xml:"d,attr"`
	R int   `xml:"r,attr,omitempty"`
}

// Struct hỗ trợ build VOD
type VODAdaptationSet struct {
	ID          string
	ContentType string
	Par         string
	FrameRate   string
	Reps        []VODRepresentation
}

type VODRepresentation struct {
	ID             string
	MimeType       string
	Codecs         string
	Bandwidth      string
	Width          string
	Height         string
	Sar            string
	Timescale      int
	Initialization string
	Media          string
	StartNumber    int
	Timeline       []mpdTimelineEntry
}

// --- Logic xử lý ---

func ParseLiveMPD(streamDir string) (*mpdRoot, error) {
	mpdPath := filepath.Join(streamDir, "manifest.mpd")
	data, err := os.ReadFile(mpdPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read manifest.mpd: %w", err)
	}

	var mpd mpdRoot
	if err := xml.Unmarshal(data, &mpd); err != nil {
		return nil, fmt.Errorf("failed to parse manifest.mpd: %w", err)
	}

	return &mpd, nil
}

func BuildVODManifest(liveMPD *mpdRoot, streamID, cdnBaseURL string) (string, error) {
	if len(liveMPD.Periods) == 0 {
		return "", fmt.Errorf("no periods found in live MPD")
	}

	period := liveMPD.Periods[0]
	var adaptationSets []VODAdaptationSet
	mpdDuration := liveMPD.MediaPresentationDuration

	for _, as := range period.AdaptationSets {
		vodAS := VODAdaptationSet{
			ID:          as.ID,
			ContentType: as.ContentType,
			Par:         as.Par,
			FrameRate:   as.FrameRate,
		}

		for _, rep := range as.Representations {
			if rep.SegmentTemplate == nil || rep.SegmentTemplate.Timeline == nil {
				continue
			}

			tpl := rep.SegmentTemplate
			startNum := tpl.StartNumber
			if startNum < 1 {
				startNum = 1
			}

			missingCount := startNum - 1
			var fullTimeline []mpdTimelineEntry

			if missingCount > 0 && len(tpl.Timeline.Entries) > 0 {
				firstOriginalT := tpl.Timeline.Entries[0].T
				if firstOriginalT > 0 {
					avgD := firstOriginalT / int64(missingCount)

					fullTimeline = append(fullTimeline, mpdTimelineEntry{
						T: 0,
						D: avgD,
						R: missingCount - 1,
					})
				}
			}

			for i, entry := range tpl.Timeline.Entries {
				newEntry := entry
				if missingCount == 0 && i == 0 {
					newEntry.T = 0
				} else if i > 0 {
					newEntry.T = 0
				}
				fullTimeline = append(fullTimeline, newEntry)
			}

			mType := rep.MimeType
			if mType == "" {
				mType = as.MimeType
			}
			cType := as.ContentType
			if cType == "audio" || strings.Contains(rep.Codecs, "mp4a") {
				mType = "audio/mp4"
				cType = "audio"
			}

			vodRep := VODRepresentation{
				ID:             rep.ID,
				MimeType:       mType,
				Codecs:         rep.Codecs,
				Bandwidth:      rep.Bandwidth,
				Width:          rep.Width,
				Height:         rep.Height,
				Sar:            rep.Sar,
				Timescale:      tpl.Timescale,
				Initialization: tpl.Initialization,
				Media:          tpl.Media,
				StartNumber:    1,
				Timeline:       fullTimeline,
			}
			vodAS.ContentType = cType
			vodAS.Reps = append(vodAS.Reps, vodRep)
		}
		adaptationSets = append(adaptationSets, vodAS)
	}

	baseURL := fmt.Sprintf("%s/%s/", cdnBaseURL, streamID)

	var sb strings.Builder
	sb.WriteString(`<?xml version="1.0" encoding="utf-8"?>` + "\n")
	sb.WriteString(`<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" profiles="urn:mpeg:dash:profile:isoff-live:2011" type="static" `)
	fmt.Fprintf(&sb, `mediaPresentationDuration="%s" minBufferTime="PT4S">`+"\n", mpdDuration)
	fmt.Fprintf(&sb, `  <BaseURL>%s</BaseURL>`+"\n", baseURL)
	fmt.Fprintf(&sb, `  <Period id="p0" start="PT0S" duration="%s">`+"\n", mpdDuration)

	for _, as := range adaptationSets {
		asAttrs := ""
		if as.ContentType == "video" {
			if as.Par != "" {
				asAttrs += fmt.Sprintf(` par="%s"`, as.Par)
			}
			if as.FrameRate != "" {
				asAttrs += fmt.Sprintf(` frameRate="%s"`, as.FrameRate)
			}
		}

		fmt.Fprintf(&sb, `    <AdaptationSet id="%s" contentType="%s" segmentAlignment="true"%s>`+"\n", as.ID, as.ContentType, asAttrs)

		for _, rep := range as.Reps {
			dimAttr := ""
			if rep.Width != "" {
				dimAttr = fmt.Sprintf(` width="%s" height="%s"`, rep.Width, rep.Height)
			}
			if rep.Sar != "" {
				dimAttr += fmt.Sprintf(` sar="%s"`, rep.Sar)
			}

			fmt.Fprintf(&sb, `      <Representation id="%s" mimeType="%s" codecs="%s" bandwidth="%s"%s>`+"\n",
				rep.ID, rep.MimeType, rep.Codecs, rep.Bandwidth, dimAttr)
			fmt.Fprintf(&sb, `        <SegmentTemplate timescale="%d" initialization="%s" media="%s" startNumber="%d">`+"\n",
				rep.Timescale, rep.Initialization, rep.Media, rep.StartNumber)
			sb.WriteString(`          <SegmentTimeline>` + "\n")

			for i, s := range rep.Timeline {
				tAttr := ""
				if i == 0 {
					tAttr = ` t="0"`
				} else if s.T > 0 {
					tAttr = fmt.Sprintf(` t="%d"`, s.T)
				}

				rAttr := ""
				if s.R > 0 {
					rAttr = fmt.Sprintf(` r="%d"`, s.R)
				}
				fmt.Fprintf(&sb, `            <S%s d="%d"%s/>`+"\n", tAttr, s.D, rAttr)
			}

			sb.WriteString(`          </SegmentTimeline>` + "\n")
			sb.WriteString(`        </SegmentTemplate>` + "\n")
			sb.WriteString(`      </Representation>` + "\n")
		}
		sb.WriteString(`    </AdaptationSet>` + "\n")
	}
	sb.WriteString(`  </Period>` + "\n")
	sb.WriteString(`</MPD>`)

	return sb.String(), nil
}

func BuildAndSaveVODManifest(streamDir, streamID, cdnBaseURL string) (string, error) {
	liveMPD, err := ParseLiveMPD(streamDir)
	if err != nil {
		return "", err
	}
	vodManifest, err := BuildVODManifest(liveMPD, streamID, cdnBaseURL)
	if err != nil {
		return "", err
	}
	vodPath := filepath.Join(streamDir, "vod.mpd")
	return vodPath, os.WriteFile(vodPath, []byte(vodManifest), 0644)
}
