import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Type, Image, Square } from "lucide-react";

interface AddComponentDialogProps {
  onAdd: (component: any) => void;
}

export const AddComponentDialog = ({ onAdd }: AddComponentDialogProps) => {
  const [open, setOpen] = useState(false);

  const componentTypes = [
    {
      type: 'text',
      icon: Type,
      label: 'Text',
      description: 'Add a text element',
      defaultProps: {
        text: 'New Text',
        color: '#000000',
        fontSize: 'base',
        alignment: 'left',
      },
    },
    {
      type: 'image',
      icon: Image,
      label: 'Image',
      description: 'Add an image',
      defaultProps: {
        imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926',
        color: '#000000',
      },
    },
    {
      type: 'button',
      icon: Square,
      label: 'Button',
      description: 'Add a button',
      defaultProps: {
        text: 'Click Me',
        color: '#ffffff',
        bgColor: '#3b82f6',
        fontSize: 'base',
        alignment: 'center',
      },
    },
  ];

  const handleAdd = (component: any) => {
    const newComponent = {
      id: `component-${Date.now()}`,
      type: component.type,
      ...component.defaultProps,
    };
    onAdd(newComponent);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {componentTypes.map((component) => {
            const Icon = component.icon;
            return (
              <Card
                key={component.type}
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleAdd(component)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{component.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {component.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
