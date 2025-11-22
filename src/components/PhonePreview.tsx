import { useState } from 'react';
import { PhoneMockup } from './PhoneMockup';
import { RotateCw } from 'lucide-react';

interface PhonePreviewProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PhonePreview = ({ children, isLoading = false }: PhonePreviewProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center space-y-4">
            <RotateCw className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your app...</p>
          </div>
        ) : (
          <div className="transition-transform duration-300">
            <PhoneMockup>
              {children}
            </PhoneMockup>
          </div>
        )}
      </div>
    </div>
  );
};
