import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, Database, Flame, ExternalLink } from "lucide-react";

interface IntegrationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IntegrationsModal = ({ open, onOpenChange }: IntegrationsModalProps) => {
  const integrations = [
    {
      name: "GitHub",
      icon: Github,
      description: "Connect your GitHub repository for version control and collaboration",
      features: [
        "Automatic code sync",
        "Branch management",
        "Pull request integration",
        "CI/CD workflows"
      ],
      action: () => {
        window.open("https://github.com/apps/lovable", "_blank");
      },
      buttonText: "Connect GitHub"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">GitHub Integration</DialogTitle>
          <DialogDescription>
            Connect your GitHub repository for version control and collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.name} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Key Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {integration.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button onClick={integration.action} className="w-full sm:w-auto">
                      {integration.buttonText}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
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
