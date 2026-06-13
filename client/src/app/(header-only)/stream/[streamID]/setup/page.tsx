import { getStreamSession } from "@/features/setup-stream/api/stream-setup.api";
import { SetupStreamLayout } from "@/features/setup-stream/components/SetupStreamLayout";
import { redirect } from "next/navigation";

interface SetupStreamPageProps {
  params: Promise<{
    streamID: string;
  }>;
}

const SetupStreamPage = async ({ params }: SetupStreamPageProps) => {
  const param = await params;

  try {
    const session = await getStreamSession(param.streamID);

    return (
      <SetupStreamLayout
        streamId={param.streamID}
        session={session.manifestUrl}
        sessionExpires={session.expiresMs}
      />
    );
  } catch (error) {
    return redirect("/stream/manager");
  }
};

export default SetupStreamPage;
