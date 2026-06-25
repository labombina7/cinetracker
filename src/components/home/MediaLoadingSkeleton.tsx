
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MediaLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div key={item}>
              <Skeleton className="h-[350px] w-full mb-2" />
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaLoadingSkeleton;
