import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { WidgetPreviewShell } from "@/modules/widget/ui/views/widget-preview-shell";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
    mode?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const organizationId = params.organizationId || "";
  const mode = params.mode === "preview" ? "preview" : "production";

  if (mode === "preview") {
    return <WidgetPreviewShell organizationId={organizationId} mode={mode} />;
  }

  return <WidgetView organizationId={organizationId} mode={mode} />;
};

export default Page;