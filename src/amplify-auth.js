import { config, isDemo } from './config.js';

export async function configureAuth() {
  if (isDemo) return;
  const { Amplify } = await import('aws-amplify');
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
      },
    },
  });
}
