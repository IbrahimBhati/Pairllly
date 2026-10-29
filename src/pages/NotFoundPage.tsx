import React from 'react';
import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-18rem)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl font-black text-[#4B3F72] font-mono">404</span>
        <h1 className="text-2xl font-bold text-[#1F2937]">Page Not Found</h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          The skill page or route you are looking for doesn&apos;t exist or has moved. Return to the homepage or explore available skills.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('/')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Home
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('/explore')}
          >
            Explore Skills
          </Button>
        </div>
      </div>
    </div>
  );
};
