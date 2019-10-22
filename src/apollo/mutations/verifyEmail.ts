import { gql } from 'apollo-boost';

export default gql`
  mutation VerifyEmail(
    $email: String!
    $url: String!
    $toResetPassword: Boolean
  ) {
    mCheckEmail(
      input: { email: $email, url: $url, toResetPassword: $toResetPassword }
    ) {
      success
    }
  }
`;

export interface IVerifyEmail {
  mCheckEmail: {
    success: boolean;
  };
}

export interface IVerifyEmailVariables {
  email: string;
  url: string;
  toResetPassword?: boolean;
}
