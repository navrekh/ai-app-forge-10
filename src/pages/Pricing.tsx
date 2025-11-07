import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            MobileDev Builder
          </h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start free, then buy credits as you need them
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8 border-2">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Free</h2>
              <div className="text-4xl font-bold mb-2">₹0</div>
              <p className="text-muted-foreground">Get started for free</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>5 free credits to try the platform</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Generate up to 5 mobile apps</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Access to all features</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Preview generated apps</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/auth")} 
              variant="outline"
              className="w-full"
            >
              Start Free
            </Button>
          </Card>

          {/* Credit Package */}
          <Card className="p-8 border-2 border-primary shadow-glow">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Best Value
              </div>
              <h2 className="text-2xl font-bold mb-2">Credit Package</h2>
              <div className="text-4xl font-bold mb-2">₹3,000</div>
              <p className="text-muted-foreground">100 credits</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>100 credits for app generation</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Generate up to 100 mobile apps</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Credits never expire</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Download APK & IPA files</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/auth")} 
              className="w-full"
            >
              Buy Credits
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Each credit = 1 app generation • No hidden fees • No subscriptions
          </p>
          <p className="text-sm text-muted-foreground">
            Need more credits? Contact us for bulk pricing options
          </p>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MobileDev Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
