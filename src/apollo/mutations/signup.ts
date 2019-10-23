import { gql } from 'apollo-boost';

export default gql`
  mutation CreateUser($name: String!, $token: String!, $password: String!) {
    createMUser(input: { name: $name, token: $token, password: $password }) {
      jwtToken
    }
  }
`;

export interface ISignup {
  createMUser: {
    jwtToken: string;
  };
}

export interface ISignupVariables {
  name: string;
  token: string;
  password: string;
}
