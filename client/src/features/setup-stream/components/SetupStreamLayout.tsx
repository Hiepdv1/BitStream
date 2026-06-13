"use client";

import Link from "next/link";
import { ExternalLink, KeyRound } from "lucide-react";
import { CopyableField } from "@/components/ui/CopyableField";
import { QuickSetupGuide } from "./QuickSetupGuide";
import { StreamPreview } from "./StreamPreview";
import { Button } from "@/components/ui/Button";
import { useStreamKey } from "../hooks/useStreamKey";
import { SetupStreamSkeleton } from "./SetupStreamSkeleton";
import { notFound } from "next/navigation";

interface SetupStreamLayoutProps {
  streamId: string;
  session: string;
  sessionExpires: number;
}

export const SetupStreamLayout = ({
  streamId,
  session,
  sessionExpires,
}: SetupStreamLayoutProps) => {
  const { data, isLoading, isError, error } = useStreamKey({
    streamID: streamId,
  });

  if (isLoading) {
    return <SetupStreamSkeleton />;
  }

  if (isError || !data) {
    return notFound();
  }

  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt).toLocaleString()
    : "NONE";

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Stream Setup
          </h1>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/stream/manager" className="flex-1 sm:flex-none">
              <Button
                variant="ghost"
                size="sm"
                className="w-full border border-border"
              >
                Back to Dashboard
              </Button>
            </Link>
            <Link href={`/watch/${streamId}`} className="flex-1 sm:flex-none">
              <Button variant="primary" size="sm" className="w-full">
                Go to Stream Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Area: 3 Columns on very large screens, 2 on laptop, 1 on mobile */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Stream Preview (Small) */}
          <div className="w-full lg:w-[400px] xl:w-[480px] shrink-0">
            <StreamPreview streamId={streamId} dashUrl={session} />
            <div className="mt-4 p-4 rounded-xl bg-brand/10 border border-brand/20">
              <h4 className="text-sm font-bold text-brand mb-1">Status</h4>
              <p className="text-xs text-text-muted">
                Your preview player is waiting for a signal. Start streaming
                from your encoder and the video will appear here automatically.
              </p>
            </div>
          </div>

          {/* Right Columns: Configuration */}
          <div className="flex-1 w-full grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
            {/* Middle: Connection Details */}
            <div className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand" />
                Connection Details
              </h3>

              <div className="space-y-5 flex-1">
                <CopyableField label="STREAM ID" value={data.streamID} />

                <CopyableField
                  label="STREAM KEY (KEEP SECRET)"
                  value={data.streamKey}
                  isSecret
                />

                <CopyableField label="RTMP SERVER URL" value={data.rtmpUrl} />

                <CopyableField
                  label="DASH SERVER URL"
                  value={data.dashUrl}
                  extraAction={
                    <a
                      href={`/watch/${data.streamID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer flex items-center text-xs font-medium text-text-muted hover:text-text-main transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open Player Client
                    </a>
                  }
                />

                <CopyableField label="EXPIRES AT" value={expiresAt} />
              </div>
            </div>

            {/* Right: Quick Start Guide */}
            <div className="h-full">
              <QuickSetupGuide />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
