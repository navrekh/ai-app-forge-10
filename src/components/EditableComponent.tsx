import { cn } from "@/lib/utils";

interface EditableComponentProps {
  component: any;
  isSelected: boolean;
  onClick: () => void;
}

export const EditableComponent = ({ component, isSelected, onClick }: EditableComponentProps) => {
  const fontSizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const alignmentMap: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const baseClasses = cn(
    "cursor-pointer transition-all",
    "hover:ring-2 hover:ring-primary/50",
    isSelected && "ring-2 ring-primary shadow-lg"
  );

  if (component.type === 'text') {
    return (
      <div
        onClick={onClick}
        className={cn(
          baseClasses,
          "p-3 rounded-lg",
          fontSizeMap[component.fontSize || 'base'],
          alignmentMap[component.alignment || 'left']
        )}
        style={{ color: component.color }}
      >
        {component.text}
      </div>
    );
  }

  if (component.type === 'image') {
    return (
      <div onClick={onClick} className={cn(baseClasses, "rounded-lg overflow-hidden")}>
        <img
          src={component.imageUrl}
          alt="Component"
          className="w-full h-48 object-cover"
        />
      </div>
    );
  }

  if (component.type === 'button') {
    return (
      <div
        onClick={onClick}
        className={cn(
          baseClasses,
          "px-4 py-2 rounded-lg font-semibold inline-block",
          fontSizeMap[component.fontSize || 'base'],
          alignmentMap[component.alignment || 'center']
        )}
        style={{
          color: component.color,
          backgroundColor: component.bgColor,
        }}
      >
        {component.text}
      </div>
    );
  }

  return null;
};
