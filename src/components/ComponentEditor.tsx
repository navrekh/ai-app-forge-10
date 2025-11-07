import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

interface ComponentEditorProps {
  selectedComponent: any;
  onUpdate: (updates: any) => void;
  onSave: () => void;
}

export const ComponentEditor = ({ selectedComponent, onUpdate, onSave }: ComponentEditorProps) => {
  if (!selectedComponent) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Component Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a component in the phone preview to edit its properties
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Edit Component</CardTitle>
        <p className="text-sm text-muted-foreground">
          Type: {selectedComponent.type}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Content */}
        {selectedComponent.type !== 'image' && (
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              value={selectedComponent.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter text..."
            />
          </div>
        )}

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={selectedComponent.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              value={selectedComponent.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        {/* Font Size */}
        {selectedComponent.type !== 'image' && (
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select
              value={selectedComponent.fontSize || 'base'}
              onValueChange={(value) => onUpdate({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="xs">Extra Small</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="2xl">2X Large</SelectItem>
                <SelectItem value="3xl">3X Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Alignment */}
        {selectedComponent.type !== 'image' && (
          <div className="space-y-2">
            <Label htmlFor="alignment">Alignment</Label>
            <Select
              value={selectedComponent.alignment || 'left'}
              onValueChange={(value) => onUpdate({ alignment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Image URL */}
        {selectedComponent.type === 'image' && (
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={selectedComponent.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {/* Background Color */}
        {selectedComponent.type === 'button' && (
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={selectedComponent.bgColor || '#3b82f6'}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={selectedComponent.bgColor || '#3b82f6'}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        )}

        <Button onClick={onSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};
