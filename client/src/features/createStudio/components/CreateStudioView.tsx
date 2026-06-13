"use client";

import Image from "next/image";
import { Video, Users, Gift, Loader2, AlertTriangle } from "lucide-react";
import bgCreateStudio from "../assets/bg-create-studio.jpg";
import { useCreateStudio } from "../hook/useCreateStudio";
import { toast } from "sonner";
import { useAppQueryClient } from "@/hooks";
import { useRouter } from "next/navigation";

const FEATURE_CARDS = [
  {
    icon: <Video className="w-6 h-6 text-brand" />,
    title: "Go Live",
    description: "Create streams and broadcast instantly to a global audience.",
  },
  {
    icon: <Users className="w-6 h-6 text-brand" />,
    title: "Build Your Audience",
    description:
      "Grow a dedicated community around your unique content and personality.",
  },
  {
    icon: <Gift className="w-6 h-6 text-brand" />,
    title: "Receive Gifts",
    description:
      "Enable gifts and receive direct support from your passionate viewers.",
  },
];

export const CreateStudioView = () => {
  const { mutate: createStudio, isPending, error } = useCreateStudio();
  const { invalidateProfile } = useAppQueryClient();
  const router = useRouter();

  const handleCreateStudio = () => {
    createStudio(null, {
      onSuccess: (data) => {
        invalidateProfile();
        toast.success("Studio created successfully");
        router.push(`/studio/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {},
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full flex flex-col items-center">
        {/* Main Illustration */}
        <div className="w-full max-w-2xl aspect-16/9 relative mb-10 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={bgCreateStudio}
            alt="Create your personal studio"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="text-center mb-16">
          <h1 className="text-2xl font-extrabold text-text-main mb-6 tracking-tight">
            Start Your Creator Journey
          </h1>
          <p className="text-md text-text-muted max-w-2xl mx-auto leading-relaxed">
            Create your personal studio and start sharing your content with the
            community. Go live, build an audience, and receive gifts from
            viewers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          {FEATURE_CARDS.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-border transition-all duration-300 shadow-sm"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-brand/10 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-md font-bold text-text-main mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center w-full max-w-md">
          {error && (
            <div className="w-full mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {error.message || "Failed to create studio. Please try again."}
              </span>
            </div>
          )}

          <button
            onClick={handleCreateStudio}
            disabled={isPending}
            className="cursor-pointer px-10 py-4 bg-brand hover:bg-brand/90 text-white text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,74,0.3)] hover:shadow-[0_0_30px_rgba(255,107,74,0.5)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-w-[240px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              "Create My Studio"
            )}
          </button>
          <p className="mt-6 text-sm text-text-muted text-center">
            Creating a studio is free and only takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
};
