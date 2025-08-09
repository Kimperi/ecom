import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_62Oor9ilB',       // <-- your User Pool ID
      userPoolClientId: '1cg8eah6nisuj4rcmkg8bmgj36', // <-- your App Client ID
      loginWith: { email: true },
      signUpVerificationMethod: 'code',
    },
  },
});

export default {};
