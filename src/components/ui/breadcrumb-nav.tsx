import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

interface BreadcrumbNavProps {
  currentView?: 'home' | 'stats' | 'history' | 'quiz' | 'trends' | 'ai' | 'assessment' | 'blog';
}

export const BreadcrumbNav = ({ currentView = 'home' }: BreadcrumbNavProps) => {
  const viewLabels = {
    home: 'Analysis',
    stats: 'Statistics',
    history: 'History',
    quiz: 'Quiz Mode',
    trends: 'Trends',
    ai: 'AI Assistant',
    assessment: 'Assessment',
    blog: 'Blog'
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1">
            <Home className="w-3 h-3" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentView !== 'home' && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{viewLabels[currentView]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
