import gql from 'graphql-tag';

export default gql`
  mutation Authenticate($email: String!, $password: String!) {
    mAuthenticate(input: { email: $email, password: $password }) {
      jwtToken
    }
  }
`;

export interface IAuthenticate {
  mAuthenticate: {
    jwtToken: string;
  };
}

export interface IAuthenticateVariables {
  email: string;
  password: string;
}
