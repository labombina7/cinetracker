
import React from 'react';
import { Compass, TrendingUp } from 'lucide-react';

interface DataSourceInfo {
  icon: React.ReactNode;
  title: string;
  titleEn?: string;
}

export const useDataSourceInfo = (dataSource: 'discover' | 'trending'): DataSourceInfo => {
  switch (dataSource) {
    case 'discover':
      return {
        icon: React.createElement(Compass, { className: "h-5 w-5 mr-2" }),
        title: 'Descubrimientos',
        titleEn: 'Discoveries'
      };
    case 'trending':
    default:
      return {
        icon: React.createElement(TrendingUp, { className: "h-5 w-5 mr-2" }),
        title: 'Tendencias',
        titleEn: 'Trending'
      };
  }
};
