import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from "sonner";

interface ViewCodeDialogProps {
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewCodeDialog = ({ code, open, onOpenChange }: ViewCodeDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              React Native Code
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto rounded-lg border">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>

        <div className="text-sm text-muted-foreground">
          This is a generated React Native component. You can copy and use it in your React Native project.
        </div>
      </DialogContent>
    </Dialog>
  );
};
