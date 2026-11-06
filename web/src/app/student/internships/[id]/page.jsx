import InternshipDetailClient from "@/app/internships/[id]/InternshipDetailClient";

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default async function StudentInternshipDetailPage({ params }) {
  const resolvedParams = params && typeof params.then === "function" ? await params : params;
  return <InternshipDetailClient id={resolvedParams?.id} />;
}
