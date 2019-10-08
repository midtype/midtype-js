import { gql } from 'apollo-boost';

export default gql`
  mutation VerifyEmail($email: String!, $url: String!) {
    mCheckEmail(input: { email: $email, url: $url }) {
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
}
