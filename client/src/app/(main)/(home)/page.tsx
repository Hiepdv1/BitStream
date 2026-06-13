import { Suspense } from "react";
import Hero from "@/features/home/components/Hero";
import { Loading } from "@/components/ui/Loading";
import { Gamepad2, Clapperboard, Music, Code, CircleDot } from "lucide-react";

export const metadata = {
  title: "BitStream - The Future of Streaming",
  description:
    "Watch movies, series, live streams, and creative content on BitStream.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pb-20 space-y-8 bg-surface">
      <div className="px-4 lg:px-8 pt-4">
        <div className="mx-auto max-w-[1920px]">
          <Hero
            title="The Edge of Silence"
            description="Experience the visual odyssey of the year. A journey through the deepest corners of the galaxy where time itself stands still."
            imageUrl="https://images.unsplash.com/photo-1428366890462-dd4baecf492b?q=80&w=2574&auto=format&fit=crop"
            isLive={false}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        }
      >
        <div className="mx-auto max-w-[1920px] px-4 lg:px-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Trending Streams
                </h2>
                <button className="text-brand hover:text-brand-hover text-sm font-semibold transition-colors flex items-center gap-1">
                  View All{" "}
                  <span className="text-lg opacity-80 leading-none">
                    &rsaquo;
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trending Item 1 */}
                <div className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer">
                  <div className="aspect-video relative">
                    <img
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop"
                      alt="Stream 1"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 uppercase tracking-wider backdrop-blur-md">
                      <CircleDot className="w-2.5 h-2.5 fill-white animate-pulse" />{" "}
                      Live
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 overflow-hidden border border-zinc-700">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold leading-tight group-hover:text-brand transition-colors line-clamp-1">
                        Grand Finals: Omega League
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        ZenithGaming &bull; 45.2K viewers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trending Item 2 */}
                <div className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer">
                  <div className="aspect-video relative bg-[#C0D9CE] p-8 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-[#FAFAFA] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center relative overlow-hidden">
                      <span className="text-[#8AA197] font-bold text-lg tracking-widest absolute bottom-6 uppercase">
                        Live Event
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-medium text-xs px-2 py-0.5 rounded">
                      12:45
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1C362B] p-2 shrink-0 overflow-hidden flex items-center justify-center border border-zinc-700">
                      <div className="w-full h-1 bg-[#47B681] rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold leading-tight group-hover:text-brand transition-colors line-clamp-1">
                        Cyber-Noir: World Tour Live
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        LunaVibes &bull; 12K viewers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Categories
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-brand/40 transition-all rounded-2xl p-8 aspect-square group">
                  <Gamepad2 className="w-8 h-8 text-brand group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">Gaming</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-blue-500/40 transition-all rounded-2xl p-8 aspect-square group">
                  <Clapperboard className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">Cinema</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-red-500/40 transition-all rounded-2xl p-8 aspect-square group">
                  <Music className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">Music</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 hover:border-purple-500/40 transition-all rounded-2xl p-8 aspect-square group">
                  <Code className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">Creative</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
