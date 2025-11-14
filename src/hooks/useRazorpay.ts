import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (amount: number, credits: number) => {
    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to continue');
        return;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: { amount, currency: 'INR' },
        }
      );

      if (orderError || !orderData) {
        toast.error('Failed to create payment order');
        console.error('Order error:', orderError);
        return;
      }

      const { orderId, keyId } = orderData;

      // Razorpay options
      const options = {
        key: keyId,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'AppDev',
        description: `Purchase ${credits} Credits`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  credits: credits,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              toast.error('Payment verification failed');
              console.error('Verify error:', verifyError);
              return;
            }

            toast.success(
              `Payment successful! ${verifyData.credits_added} credits added. New balance: ${verifyData.new_balance} credits`,
              { duration: 5000 }
            );
            
            // Reload the page to refresh all data
            setTimeout(() => window.location.reload(), 2000);
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    }
  };

  return { initiatePayment };
};
