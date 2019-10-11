const ACTIONS: { [key: string]: IMidtypeActionMetadata } = {
  SUBSCRIBE: {
    id: 'subscribe',
    description:
      'Subscribe the logged in user to a Stripe plan. Form must include plan ID in in the data-mt-mutate-id field.'
  },
  VERIFY_EMAIL: { id: 'verifyEmail' },
  SIGNUP: { id: 'signup' },
  LOGIN: { id: 'login' },
  LOGIN_GOOGLE: { id: 'signup' },
  LOGOUT: { id: 'signup' },
  MUTATION: { id: 'mutation' }
};

export default ACTIONS;
