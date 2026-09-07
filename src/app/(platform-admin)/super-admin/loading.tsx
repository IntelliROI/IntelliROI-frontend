import { SectionLoader } from "@/components/feedback/States";

export default function PlatformSegmentLoading() {
  return (
    <SectionLoader
      label="Loading"
      height="min-h-[60vh]"
      className="border-0 bg-transparent"
    />
  );
}
