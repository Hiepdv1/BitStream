import { Suspense } from "react";
import { Metadata } from "next";
import {
  VideoPlayer,
  VideoInfo,
  VideoRecommendations,
  LiveChat,
  WatchView,
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
      `/stream/${streamId}`,
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

      <WatchView
        streamId={streamId}
        streamData={streamData}
        recommendedVideos={RECOMMENDED_VIDEOS}
      />
    </div>
  );
}
