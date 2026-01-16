import { Suspense } from "react";
import { Hero, ContentSection } from "@/features/home/components";
import { Loading } from "@/components/ui/Loading";

const TRENDING_ITEMS = [
  {
    id: "1",
    title: "Cyberpunk: Edgerunners",
    description:
      "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1533967926135-2aa978c738e4?q=80&w=2600&auto=format&fit=crop",
    category: "Anime",
  },
  {
    id: "2",
    title: "Arcane: League of Legends",
    description:
      "Set in Utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515525547407-7ae0e6ba39d4?q=80&w=2000&auto=format&fit=crop",
    category: "Series",
  },
  {
    id: "3",
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop",
    category: "Movie",
  },
  {
    id: "4",
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2613&auto=format&fit=crop",
    category: "Sci-Fi",
  },
  {
    id: "5",
    title: "The Tech Review",
    description:
      "Weekly deep dive into the latest gadgets and software updates.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2671&auto=format&fit=crop",
    category: "Tech",
  },
];

const LIVE_ITEMS = [
  {
    id: "l1",
    title: "Gaming Championship 2025",
    description: "Live finals of the global tournament.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
    category: "Esports",
  },
  {
    id: "l2",
    title: "SpaceX Launch Event",
    description: "Starship orbital flight test coverage.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2670&auto=format&fit=crop",
    category: "Science",
  },
  {
    id: "l3",
    title: "Coding Marathon",
    description: "24h charity coding stream building a react app.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2670&auto=format&fit=crop",
    category: "Coding",
  },
];

const NEW_ARRIVALS = [
  {
    id: "n1",
    title: "Dune: Part Two",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2576&auto=format&fit=crop",
    category: "Movie",
  },
  {
    id: "n2",
    title: "The Last of Us",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1596727147705-54a9d083095e?q=80&w=2670&auto=format&fit=crop",
    category: "Series",
  },
  {
    id: "n3",
    title: "Spider-Man 2 Gameplay",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2578&auto=format&fit=crop",
    category: "Gaming",
  },
  {
    id: "n4",
    title: "React 19 Tutorial",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
    category: "Education",
  },
  {
    id: "n5",
    title: "AI Revolution Doc",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop",
    category: "Documentary",
  },
];

export const metadata = {
  title: "BitStream - The Future of Streaming",
  description:
    "Watch movies, series, live streams, and creative content on BitStream.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pb-20 space-y-8 bg-background">
      <Hero
        title="Welcome to BitStream"
        description="Experience the next generation of entertainment. From blockbuster movies to live esports and educational content, stream it all in one place."
        imageUrl="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop"
        isLive={false}
      />

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            <Loading />
          </div>
        }
      >
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <ContentSection title="Live Now" items={LIVE_ITEMS} variant="wide" />

          <ContentSection
            title="Trending on BitStream"
            items={TRENDING_ITEMS}
            variant="card"
          />

          <ContentSection
            title="New Arrivals"
            items={NEW_ARRIVALS}
            variant="poster"
            viewAllLink="/browse/new"
          />
        </div>
      </Suspense>
    </div>
  );
}
