import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cognitoAuth } from "@/utils/cognitoAuth";
import { Hub } from 'aws-amplify/utils';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    cognitoAuth.getCurrentUser().then((user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setAuthenticated(true);
          break;
        case 'signedOut':
          setAuthenticated(false);
          break;
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth-cognito" replace />;
  }

  return <>{children}</>;
};
