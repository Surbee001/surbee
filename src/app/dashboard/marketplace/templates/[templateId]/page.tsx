import { ImageKitProvider } from "@imagekit/next";
import { notFound } from "next/navigation";

import {
  getRelatedTemplates,
  getTemplateById,
} from "@/lib/community/data";
import { TemplateDetailView } from "@/components/community/TemplateDetailView";

interface TemplateDetailPageProps {
  params: {
    templateId: string;
  };
  searchParams?: {
    action?: string;
  };
}

export default function TemplateDetailPage({
  params,
  searchParams,
}: TemplateDetailPageProps) {
  const template = getTemplateById(params.templateId);
  if (!template) {
    notFound();
  }

  const related = getRelatedTemplates(template.id, 4);

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <TemplateDetailView
        template={template}
        relatedTemplates={related}
        highlightAction={searchParams?.action}
      />
    </ImageKitProvider>
  );
}

