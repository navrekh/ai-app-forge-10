import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

const Refunds = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. General Policy</h2>
            <p className="text-muted-foreground">
              At AppDev, we stand behind the quality of our service. However, due to the nature of digital credits and instant service delivery, all credit purchases are final and non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Non-Refundable Credits</h2>
            <p className="text-muted-foreground">
              Once credits are purchased and added to your account, they cannot be refunded or exchanged for cash. This policy applies to all credit packages, including the 100 credits for ₹3000 package.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Used Credits</h2>
            <p className="text-muted-foreground">
              Credits that have been used to generate applications cannot be refunded under any circumstances, as the service has already been rendered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Service Issues</h2>
            <p className="text-muted-foreground">
              If you experience technical issues that prevent you from using your credits, please contact our support team. We will investigate the issue and may provide additional credits or other compensation at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Exceptions</h2>
            <p className="text-muted-foreground">
              Refunds may be considered in exceptional circumstances, such as:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Duplicate charges due to technical errors</li>
              <li>Unauthorized transactions on your account</li>
              <li>Service unavailability for extended periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              If you believe you are entitled to a refund, please contact us within 7 days of the transaction with details of your concern. We will review each case individually.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact for Refund Requests</h2>
            <p className="text-muted-foreground">
              For refund requests or questions about our refund policy, please visit our Contact page or email our support team.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AppDev. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Refunds;
