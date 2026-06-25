
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HomeLoadingSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[80vh]">
      <div className="text-center">
        <Skeleton className="h-10 w-40 mb-4 mx-auto" />
        <Skeleton className="h-4 w-60 mx-auto" />
      </div>
    </div>
  );
};

export default HomeLoadingSkeleton;
