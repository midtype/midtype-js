import gql from 'graphql-tag';

export default gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    mChangePassword(input: { token: $token, newPassword: $newPassword }) {
      success
    }
  }
`;

export interface IResetPassword {
  mChangePassword: {
    success: boolean;
  };
}

export interface IResetPasswordVariables {
  token: string;
  newPassword: string;
}
