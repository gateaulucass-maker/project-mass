import { SkeletonCard } from "@/components/shared/LoadingSpinner";

export function PageSkeleton() {
  return (
    <div className="flex-1 px-4 lg:px-6 py-5 space-y-4">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-64" />
    </div>
  );
}
