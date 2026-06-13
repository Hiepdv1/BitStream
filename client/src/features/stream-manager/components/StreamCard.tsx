"use client";

import {
  Clock,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  Play,
} from "lucide-react";
import { StreamItem } from "../types";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useDeleteStream } from "../hooks/useDeleteStream";
import { useConfirmStore } from "@/hooks/useConfirm";
import { useAppQueryClient } from "@/hooks";

interface StreamCardProps {
  stream: StreamItem;
  onEdit?: (stream: StreamItem) => void;
}

export const StreamCard = ({ stream, onEdit }: StreamCardProps) => {
  const isLive = stream.isLive;
  const isEnded = !stream.isLive && stream.endedAt !== null;
  const isDraft =
    !stream.isLive && stream.endedAt === null && stream.startedAt === null;

  const { mutate: deleteStream, isPending: isDeleting } = useDeleteStream();
  const { confirm } = useConfirmStore();
  const { invalidateStreamManagerList } = useAppQueryClient();

  const onDeleteStream = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isDraft && !isEnded) {
      toast.error("Only draft or ended streams can be deleted");
      return;
    }

    const isConfirmed = await confirm({
      title: "Delete Stream",
      description:
        "Are you sure you want to delete this stream? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!isConfirmed) return;

    deleteStream(stream.id, {
      onSuccess: () => {
        toast.success("Stream deleted successfully");
        invalidateStreamManagerList();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete stream");
      },
    });
  };

  const dateLabel =
    isLive && stream.startedAt
      ? `Started ${format(new Date(stream.startedAt), "MMMM d, yyyy")}`
      : isEnded && stream.endedAt
        ? `Streamed ${format(new Date(stream.endedAt), "MMMM d, yyyy")}`
        : `Created ${format(new Date(stream.createdAt), "MMMM d, yyyy")}`;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const durationLabel = formatDuration(stream.meta?.totalDuration);
  const isHidden = stream.visibility !== "PUBLIC";
  const thumbnailUrl = `${process.env.NEXT_PUBLIC_ASSET_URL}/stream-thumbnail/${stream.thumbnail_url}`;

  return (
    <div className="flex flex-col rounded-2xl bg-surface/30 border border-border/50 overflow-hidden group hover:border-border transition-colors">
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full bg-surface/50 overflow-hidden flex items-center justify-center">
        {stream.thumbnail_url ? (
          <img
            src={thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-text-muted text-sm font-semibold">
            No Thumbnail
          </div>
        )}

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Left Badge */}
        <div className="absolute top-3 left-3 flex items-center">
          {isLive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/90 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                LIVE
              </span>
            </div>
          )}
          {isDraft && (
            <div className="px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur-sm border border-border/50">
              <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                DRAFT
              </span>
            </div>
          )}
          {isEnded && (
            <div className="px-2.5 py-1 rounded-md bg-surface/90 backdrop-blur-sm border border-border/50">
              <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
                ENDED
              </span>
            </div>
          )}
        </div>

        {/* Top Right Icon */}
        {isHidden && (
          <div className="absolute top-3 right-3 p-1.5 rounded-md bg-surface/80 backdrop-blur-sm border border-border/50 text-text-muted">
            <EyeOff className="w-4 h-4" />
          </div>
        )}

        {/* Bottom Right Duration */}
        {durationLabel && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-white">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium">{durationLabel}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          className="text-base font-semibold text-text-main line-clamp-2 leading-snug group-hover:text-brand transition-colors"
          title={stream.title}
        >
          {stream.title}
        </h3>
        <p className="text-xs text-text-muted mt-2">{dateLabel}</p>

        <div className="flex-1" />

        {/* Action Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
          <div>
            {isLive && (
              <button className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold bg-surface hover:bg-surface/80 text-text-main transition-colors">
                Open Studio
              </button>
            )}
            {isDraft && (
              <button
                className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold dark:bg-[#2a1b1a] bg-zinc-100 text-brand dark:hover:bg-[#3a2523] hover:bg-brand/10 border border-brand/20 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit?.(stream);
                }}
              >
                Edit Draft
              </button>
            )}
            {isEnded && (
              <button className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold bg-surface/50 hover:bg-surface border border-border/50 text-text-main transition-colors">
                View Analytics
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {stream.endedAt === null && (
              <Link
                href={`/stream/${stream.id}/setup`}
                className="cursor-pointer p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                title="Stream Keys"
              >
                <Eye className="w-4 h-4" />
              </Link>
            )}
            {stream.endedAt && (
              <Link
                href={`/watch/${stream.id}`}
                className="cursor-pointer p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                title="Watch"
              >
                <Play className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(stream);
              }}
              className="cursor-pointer p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {(!isLive || isDraft) && (
              <button
                onClick={onDeleteStream}
                disabled={isDeleting}
                className="cursor-pointer p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-error" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
