
import React from 'react';

const TraktLoadingState: React.FC = () => {
  return (
    <div className="text-center py-4">
      <div className="animate-pulse">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/3 mx-auto"></div>
      </div>
    </div>
  );
};

export default TraktLoadingState;
