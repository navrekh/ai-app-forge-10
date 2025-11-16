import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Github, Store, Apple, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PublishModal = ({ open, onOpenChange }: PublishModalProps) => {
  const handleGitHubConnect = () => {
    toast.info("Opening GitHub integration...");
    // In Lovable, this would be done through the UI
    window.open('https://docs.lovable.dev/tips-tricks/github', '_blank');
  };

  const handlePublishPlayStore = () => {
    toast.success("Starting Play Store publishing process...");
    // This would trigger the actual build and publish flow
  };

  const handlePublishAppStore = () => {
    toast.success("Starting App Store publishing process...");
    // This would trigger the actual build and publish flow
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Publish Your App</DialogTitle>
          <DialogDescription>
            Deploy your app to GitHub, Google Play Store, and Apple App Store
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="playstore">
              <Store className="w-4 h-4 mr-2" />
              Play Store
            </TabsTrigger>
            <TabsTrigger value="appstore">
              <Apple className="w-4 h-4 mr-2" />
              App Store
            </TabsTrigger>
          </TabsList>

          {/* GitHub Tab */}
          <TabsContent value="github" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Connect to GitHub
                </CardTitle>
                <CardDescription>
                  Sync your code with GitHub for version control and collaboration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Automatic Sync</p>
                      <p className="text-sm text-muted-foreground">
                        Two-way sync between Lovable and GitHub - changes automatically push both ways
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Version Control</p>
                      <p className="text-sm text-muted-foreground">
                        Full Git history with branches and rollback capabilities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Self-Hosting Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Deploy your code anywhere once it's on GitHub
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium text-sm">How to Connect:</p>
                  <ol className="text-sm space-y-1 ml-4 list-decimal text-muted-foreground">
                    <li>Click the GitHub button in Lovable's top navigation</li>
                    <li>Select "Connect to GitHub"</li>
                    <li>Authorize the Lovable GitHub App</li>
                    <li>Click "Create Repository" to generate your repo</li>
                  </ol>
                </div>

                <Button onClick={handleGitHubConnect} className="w-full">
                  <Github className="w-4 h-4 mr-2" />
                  View GitHub Integration Guide
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Play Store Tab */}
          <TabsContent value="playstore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Publish to Google Play Store
                </CardTitle>
                <CardDescription>
                  Deploy your Android app to millions of users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Prerequisites:
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 ml-4 mt-2 space-y-1 list-disc">
                    <li>Google Play Developer account ($25 one-time fee)</li>
                    <li>App built and tested (APK/AAB file ready)</li>
                    <li>App privacy policy URL</li>
                    <li>App screenshots and promotional graphics</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Publishing Steps:</h4>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Download APK/AAB", desc: "Build and download your Android app bundle" },
                      { step: 2, title: "Create Developer Account", desc: "Sign up at play.google.com/console" },
                      { step: 3, title: "Create App Listing", desc: "Fill in app details, screenshots, and description" },
                      { step: 4, title: "Upload Build", desc: "Upload your APK/AAB file" },
                      { step: 5, title: "Set Pricing & Distribution", desc: "Choose countries and pricing model" },
                      { step: 6, title: "Submit for Review", desc: "Submit app for Google's review (1-3 days)" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePublishPlayStore} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Start Play Store Publishing
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Store Tab */}
          <TabsContent value="appstore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Publish to Apple App Store
                </CardTitle>
                <CardDescription>
                  Deploy your iOS app to Apple's App Store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Prerequisites:
                  </p>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 ml-4 mt-2 space-y-1 list-disc">
                    <li>Apple Developer account ($99/year)</li>
                    <li>Mac computer with Xcode installed</li>
                    <li>IPA file built and tested</li>
                    <li>App privacy policy and terms of service</li>
                    <li>App screenshots for all device sizes</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Publishing Steps:</h4>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Download IPA", desc: "Build and download your iOS app package" },
                      { step: 2, title: "Join Apple Developer Program", desc: "Sign up at developer.apple.com ($99/year)" },
                      { step: 3, title: "Create App in App Store Connect", desc: "Set up your app listing and metadata" },
                      { step: 4, title: "Upload Build via Xcode", desc: "Use Xcode or Transporter to upload IPA" },
                      { step: 5, title: "Complete App Information", desc: "Add screenshots, description, and privacy details" },
                      { step: 6, title: "Submit for Review", desc: "Submit for Apple's review (1-7 days typically)" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePublishAppStore} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Start App Store Publishing
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
