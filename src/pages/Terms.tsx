import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using MobileDev Builder, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to use MobileDev Builder for generating mobile applications. This license shall automatically terminate if you violate any of these restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Credits System</h2>
            <p className="text-muted-foreground">
              MobileDev Builder operates on a credit-based system. Each new user receives 5 free credits. Additional credits can be purchased as needed. Credits are non-transferable and non-refundable once used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Generated Content</h2>
            <p className="text-muted-foreground">
              You retain ownership of the mobile applications generated through our platform. However, you are responsible for ensuring that your usage complies with all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain 99% uptime but do not guarantee uninterrupted access to our services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              MobileDev Builder shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>
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

export default Terms;
