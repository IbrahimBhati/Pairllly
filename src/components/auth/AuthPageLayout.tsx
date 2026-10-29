import React from 'react';
import { AppLogo } from '../ui/AppLogo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { cn } from '../../lib/utils';

export interface AuthPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
  onNavigateHome?: () => void;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
  onNavigateHome,
}) => {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={cn('w-full space-y-6', maxWidths[maxWidth], className)}>
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          {onNavigateHome ? (
            <button
              onClick={onNavigateHome}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] rounded-xl"
            >
              <AppLogo size="lg" showTagline={false} />
            </button>
          ) : (
            <AppLogo size="lg" showTagline={false} />
          )}
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg border-[#E2E8F0]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-[#1F2937] font-extrabold">{title}</CardTitle>
            <CardDescription className="text-sm mt-1">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">{children}</CardContent>

          {footer && (
            <CardFooter className="flex justify-center border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};
