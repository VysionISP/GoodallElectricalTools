import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader, Button } from "@/components/ui";
import { SiteForm } from "../../site-form";
import { updateSiteAction, deleteSiteAction } from "@/lib/actions/sites";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const site = await prisma.site.findUnique({ where: { id } });
  if (!site || site.businessId !== session.user.businessId) notFound();

  const boundUpdate = updateSiteAction.bind(null, site.id);
  const boundDelete = deleteSiteAction.bind(null, site.id);

  return (
    <div>
      <PageHeader title={`Edit ${site.name}`} />
      <SiteForm site={site} action={boundUpdate} submitLabel="Save changes" />
      <form action={boundDelete} className="mt-3 max-w-xl">
        <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50">
          Delete site
        </Button>
      </form>
    </div>
  );
}
