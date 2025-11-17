import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp } from 'aws-amplify/auth';

export interface CognitoUser {
  userId: string;
  username: string;
  email?: string;
  signInDetails?: any;
}

export const cognitoAuth = {
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName || '',
          },
        },
      });

      return { 
        success: true, 
        userId,
        requiresConfirmation: nextStep.signUpStep === 'CONFIRM_SIGN_UP',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async confirmSignUp(email: string, code: string) {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });
      
      return { 
        success: isSignedIn,
        requiresConfirmation: nextStep.signInStep !== 'DONE',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await getCurrentUser();
      return {
        userId: user.userId,
        username: user.username,
        signInDetails: user.signInDetails,
      };
    } catch {
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch {
      return null;
    }
  },

  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  },
};
