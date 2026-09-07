import { SectionLoader } from "@/components/feedback/States";

export default function CompanySegmentLoading() {
  return (
    <SectionLoader
      label="Loading"
      height="min-h-[60vh]"
      className="border-0 bg-transparent"
    />
  );
}
