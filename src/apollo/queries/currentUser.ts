import gql from 'graphql-tag';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    mUserInSession {
      id
      private {
        id
        name
        email
        photoUrl
      }
    }
  }
`;

export const GET_CURRENT_USER_WITH_STRIPE = gql`
  query GetCurrentUser {
    mUserInSession {
      id
      private {
        id
        name
        email
        photoUrl
      }
      subscription {
        active
        id
        pid
        plan {
          id
          slug
          amount
        }
      }
    }
  }
`;

export interface ICurrentUser {
  currentUser: IUser;
}
