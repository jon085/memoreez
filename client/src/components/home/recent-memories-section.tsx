import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Memory } from "@shared/schema";
import MemoryCard from "@/components/memories/memory-card";
import { Skeleton } from "@/components/ui/skeleton";

const RecentMemoriesSection = () => {
  const { data: memories, isLoading } = useQuery<Memory[]>({
    queryKey: ["/api/memories/public"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create skeleton memory cards for loading state
  const skeletonCards = Array(3)
    .fill(0)
    .map((_, i) => (
      <div
        key={`skeleton-${i}`}
        className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
      >
        <div className="flex-shrink-0">
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-6 flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>
    ));

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Recent Public Memories
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explore memories shared by our community
          </p>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {isLoading
            ? skeletonCards
            : memories && memories.length > 0
            ? memories.slice(0, 3).map((memory) => (
                <Link key={memory.id} href={`/memories/${memory.id}`}>
                  <a className="cursor-pointer">
                    <MemoryCard memory={memory} />
                  </a>
                </Link>
              ))
            : (
              <div className="lg:col-span-3 text-center py-12">
                <p className="text-gray-500 italic">No public memories yet. Be the first to share!</p>
              </div>
            )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/memories">
            <Button>View all memories</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentMemoriesSection;
