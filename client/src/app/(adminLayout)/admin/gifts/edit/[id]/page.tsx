import { EditGiftPage } from "@/features/admin/gifts/components/edit/EditGiftPage";

export default async function AdminEditGiftRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return <EditGiftPage id={resolvedParams.id} />;
}
