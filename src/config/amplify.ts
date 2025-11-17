import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_SrobAUGpi',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '3nh0t8seo7onn2do52s10ql6vo',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
      },
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET || 'appdevbackend',
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
