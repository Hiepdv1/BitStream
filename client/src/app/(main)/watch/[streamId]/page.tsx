import { Suspense } from "react";
import { Metadata } from "next";
import {
  VideoPlayer,
  VideoInfo,
  VideoRecommendations,
  LiveChat,
} from "@/features/watch";
import { StreamData } from "@/features/stream/types/stream";
import { serverFetch } from "@/lib/http/server/serverFetch";
import { notFound } from "next/navigation";

const RECOMMENDED_VIDEOS = [
  {
    id: "r1",
    streamId: "stream-demo-001",
    title: "Building a Real-Time Chat App with WebSocket",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2670&auto=format&fit=crop",
    creatorName: "TechStream",
    viewCount: 45200,
    duration: "1:23:45",
  },
  {
    id: "r2",
    streamId: "stream-demo-002",
    title: "Advanced TypeScript Patterns for React",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2728&auto=format&fit=crop",
    creatorName: "CodeMaster",
    viewCount: 89300,
    duration: "45:30",
  },
  {
    id: "r3",
    streamId: "stream-demo-003",
    title: "Gaming Tournament Finals 2026",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
    creatorName: "ESports Hub",
    viewCount: 234500,
    isLive: true,
  },
];

interface PageProps {
  params: Promise<{
    streamId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { streamId } = await params;

  let streamData: StreamData;

  try {
    const res = await serverFetch<StreamData>(
      `/stream/${streamId}/info`,
      {},
      {},
      false,
    );

    if (!res.data) {
      return notFound();
    }

    streamData = res.data;
  } catch (err) {
    console.log("Error: ", err);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 lg:pt-0 custom-scrollbar">
      {/* Scrollbar Customization for whole page */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        html {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>

      <div className="container max-w-[1920px] mx-auto p-0 lg:p-4 lg:space-y-4">
        {/* Main Interface: Video and Sticky Chat */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[65vh] xl:h-[75vh]">
          {/* Player Column */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden shadow-2xl relative border border-white/5">
            <VideoPlayer
              streamId={streamId}
              autoPlay={true}
              isLive={streamData.isLive}
              totalDuration={streamData.totalDuration}
            />
          </div>

          {/* Sidebar Chat Column */}
          <div className="hidden lg:block w-[340px] shrink-0 bg-background rounded-lg border border-white/5 overflow-hidden h-full">
            <LiveChat
              streamId={streamId}
              isLive={streamData.isLive}
              mode="sidebar"
            />
          </div>
        </div>

        {/* Supplementary Content Column */}
        <div className="px-4 lg:px-0 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6 max-w-7xl">
            <VideoInfo
              title={streamData.title}
              description={streamData.description || ""}
              viewCount={0}
              createdAt={streamData.createdAt}
              creatorName="Unknown"
              isLive={streamData.isLive}
            />

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-lg font-semibold mb-4">Recommended</h3>
              <VideoRecommendations
                videos={RECOMMENDED_VIDEOS}
                currentStreamId={streamId}
                layout="horizontal"
              />
            </div>
          </div>

          {/* Alignment Spacer */}
          <div className="hidden lg:block w-[340px] shrink-0" />
        </div>
      </div>

      {/* Mobile-Friendly Chat Hook */}
      <div className="lg:hidden">
        <LiveChat
          streamId={streamId}
          isLive={streamData.isLive}
          mode="mobile"
        />
      </div>
    </div>
  );
}
