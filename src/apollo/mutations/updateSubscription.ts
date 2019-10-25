import gql from 'graphql-tag';

export default gql`
  mutation UpdateSubscription($id: UUID!, $token: String!) {
    updateStripeSubscription(
      input: { id: $id, patch: { paymentSourcePid: $token } }
    ) {
      stripeSubscription {
        id
        pid
        active
      }
    }
  }
`;
