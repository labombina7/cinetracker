
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MediaDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-[300px] w-[200px] shrink-0 rounded-lg" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailSkeleton;
