import { Amplify } from "aws-amplify";
import { COGNITO_CONFIG } from "./config";

Amplify.configure({
  Auth: {
    Cognito: {
      ...COGNITO_CONFIG,
      loginWith: { email: true },
      signUpVerificationMethod: "code",
    },
  },
});

export default {};
