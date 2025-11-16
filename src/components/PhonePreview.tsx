import { useState } from 'react';
import { PhoneMockup } from './PhoneMockup';
import { Button } from './ui/button';
import { Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react';

interface PhonePreviewProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PhonePreview = ({ children, isLoading = false }: PhonePreviewProps) => {
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('phone');

  return (
    <div className="flex flex-col h-full">
      {/* Device Selector */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button
          variant={device === 'phone' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDevice('phone')}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Phone
        </Button>
        <Button
          variant={device === 'tablet' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDevice('tablet')}
        >
          <Tablet className="w-4 h-4 mr-2" />
          Tablet
        </Button>
        <Button
          variant={device === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDevice('desktop')}
        >
          <Monitor className="w-4 h-4 mr-2" />
          Desktop
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center space-y-4">
            <RotateCw className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your app...</p>
          </div>
        ) : (
          <div className={`${device === 'phone' ? 'scale-100' : device === 'tablet' ? 'scale-125' : 'scale-150'} transition-transform duration-300`}>
            <PhoneMockup>
              {children}
            </PhoneMockup>
          </div>
        )}
      </div>
    </div>
  );
};
