import WatchView from "@/features/watch/components/WatchView";
import { getStreamData } from "@/features/watch/api/watch.api";
import StreamNotFound from "./not-found";

interface PageProps {
  params: Promise<{
    streamId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { streamId } = await params;

  try {
    const data = await getStreamData(streamId);

    return (
      <div className="min-h-screen bg-background flex flex-col pt-0 custom-scrollbar">
        <WatchView streamId={streamId} streamData={data} />
      </div>
    );
  } catch (err) {
    return <StreamNotFound />;
  }
}
