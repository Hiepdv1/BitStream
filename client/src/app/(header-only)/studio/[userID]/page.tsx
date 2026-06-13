import type { Metadata } from "next";
import {
  StudioHeader,
  StudioStats,
  LiveNowSection,
  VideoGrid,
} from "@/features/studio/components";
import { getProfile } from "@/features/auth/api/auth.api";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Studio",
  description: "Creator Studio — manage your streams, videos and channel.",
};

interface StudioPageProps {
  params: Promise<{ userID: string }>;
}

const StudioPage = async ({ params }: StudioPageProps) => {
  try {
    const [profile, resolvedParams] = await Promise.all([getProfile(), params]);

    const isCreator = resolvedParams.userID === profile?.id;

    return (
      <div className="min-h-screen bg-background text-text-main w-full">
        <div className="w-full pb-24">
          {/* Hero header */}
          <StudioHeader
            isCreator={isCreator}
            userName={profile?.name ?? ""}
            avatarUrl={profile?.avatarUrl}
            followers={1_200_000}
            totalViews={12_500_000}
            isLive
          />

          <div className="px-6 md:px-10 lg:px-14">
            {/* Stats row */}
            <StudioStats
              followers={1_200_000}
              subscribers={450_000}
              totalViews={12_500_000}
              totalStreams={342}
            />

            {/* Live now (only if creator is currently live) */}
            <LiveNowSection />

            {/* Divider */}
            <div className="h-px bg-border/60 my-8" />

            {/* All videos grid */}
            <VideoGrid title="All Videos" />
          </div>
        </div>
      </div>
    );
  } catch {
    redirect("/");
  }
};

export default StudioPage;
