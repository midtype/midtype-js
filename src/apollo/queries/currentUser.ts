import { gql } from 'apollo-boost';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      private {
        name
        email
        photoUrl
      }
    }
  }
`;

export const GET_CURRENT_USER_WITH_STRIPE = gql`
  query GetCurrentUser {
    currentUser {
      id
      private {
        name
        email
        photoUrl
      }
      stripeSubscriptionBySubscriberId {
        active
        id
        pid
        stripePlan {
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
