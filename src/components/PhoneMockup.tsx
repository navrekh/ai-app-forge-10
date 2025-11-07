import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

export const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative mx-auto w-full max-w-[375px]">
      {/* Phone Frame */}
      <div className="relative rounded-[3rem] border-[14px] border-foreground/90 bg-foreground/90 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 z-10 h-[30px] w-[150px] -translate-x-1/2 rounded-b-[1.5rem] bg-foreground/90" />
        
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[2.2rem] bg-background">
          <div className="aspect-[9/19.5] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
      
      {/* Power Button */}
      <div className="absolute right-[-5px] top-[120px] h-[60px] w-[5px] rounded-r-md bg-foreground/90" />
      
      {/* Volume Buttons */}
      <div className="absolute left-[-5px] top-[100px] h-[40px] w-[5px] rounded-l-md bg-foreground/90" />
      <div className="absolute left-[-5px] top-[160px] h-[40px] w-[5px] rounded-l-md bg-foreground/90" />
    </div>
  );
};
