import { Suspense } from "react";
import { Metadata } from "next";
import {
  VideoPlayer,
  VideoInfo,
  VideoRecommendations,
  LiveChat,
} from "@/features/stream";
import { Loading } from "@/components/ui/Loading";

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
  {
    id: "r4",
    streamId: "stream-demo-004",
    title: "Lo-Fi Beats to Study and Relax",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2670&auto=format&fit=crop",
    creatorName: "ChillBeats",
    viewCount: 1250000,
    isLive: true,
  },
  {
    id: "r5",
    streamId: "stream-demo-005",
    title: "Machine Learning from Scratch - Episode 12",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop",
    creatorName: "AI Academy",
    viewCount: 67800,
    duration: "2:15:00",
  },
  {
    id: "r6",
    streamId: "stream-demo-006",
    title: "Cyberpunk 2077 Full Walkthrough",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2578&auto=format&fit=crop",
    creatorName: "GameZone",
    viewCount: 156000,
    duration: "8:45:30",
  },
];

interface PageProps {
  params: Promise<{
    streamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { streamId } = await params;
  return {
    title: `Watching Stream - BitStream`,
    description: `Watch live stream ${streamId} on BitStream`,
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { streamId } = await params;

  const streamData = {
    title: "Live Coding Session - Building a Streaming Platform",
    description:
      "Join me as we build a complete video streaming platform from scratch! Today we're working on the HLS video player integration and creating a beautiful, responsive UI.\n\nTopics covered:\n• HLS.js integration\n• Custom video controls\n• React performance optimization\n• Dark/Light mode theming",
    viewCount: 1234,
    createdAt: "Streaming now",
    creatorName: "BitStream Official",
    isLive: true,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-b from-brand/5 via-transparent to-accent/5 dark:from-brand/10 dark:to-accent/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl dark:bg-brand/20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl dark:bg-accent/20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          <div className="xl:col-span-3 space-y-4">
            <Suspense
              fallback={
                <div className="aspect-video bg-surface rounded-2xl animate-pulse flex items-center justify-center">
                  <Loading size="lg" text="Loading player..." />
                </div>
              }
            >
              <VideoPlayer
                streamId={streamId}
                title={streamData.title}
                autoPlay={true}
                isLive={streamData.isLive}
              />
            </Suspense>

            <Suspense
              fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-surface rounded-lg w-3/4" />
                  <div className="h-4 bg-surface rounded-lg w-1/2" />
                </div>
              }
            >
              <VideoInfo
                title={streamData.title}
                description={streamData.description}
                viewCount={streamData.viewCount}
                createdAt={streamData.createdAt}
                creatorName={streamData.creatorName}
                isLive={streamData.isLive}
              />
            </Suspense>

            <div className="xl:hidden">
              <Suspense
                fallback={
                  <div className="h-48 bg-surface rounded-2xl animate-pulse" />
                }
              >
                <VideoRecommendations
                  videos={RECOMMENDED_VIDEOS}
                  currentStreamId={streamId}
                  layout="horizontal"
                />
              </Suspense>
            </div>
          </div>

          <aside className="hidden xl:flex xl:flex-col gap-6">
            {streamData.isLive && (
              <LiveChat streamId={streamId} isLive={streamData.isLive} />
            )}

            <div className="sticky top-24 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide p-2 -m-2">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-40 aspect-video bg-surface rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-surface rounded w-full" />
                          <div className="h-3 bg-surface rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <VideoRecommendations
                  videos={RECOMMENDED_VIDEOS}
                  currentStreamId={streamId}
                  layout="vertical"
                />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>

      <div className="xl:hidden">
        <LiveChat streamId={streamId} isLive={streamData.isLive} />
      </div>
    </div>
  );
}
