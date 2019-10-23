/// <reference types="react-scripts" />

interface IMidtypeConfig {
  projectId: string; // Your Midtype project's ID
  endpoint: string; // Your Midtype project's endpoint
  redirectUrl: string; // Where users should be redirected to after logging in with Google.
  redirects?: { signedIn?: IRedirect[]; signedOut: IRedirect[] }; // Arrays of redirect rules for signed in and signed out users.
  stripe?: IStripeConfig; // Optional. Can be passed in now, or can be passed in as a parameter to the Midtype.enableStripe() function.
  onError?: (action: IMidtypeActionRef, e: Error) => void; // Optional. A function that will be called every time Midtype encounters an error.
}

interface IStripeConfig {
  pk: string; // Your Stripe publishable key
  options?: any; // Any additional options to pass into the Stripe Elements init function (see: https://stripe.com/docs/stripe-js/reference#stripe-elements)
}

interface IUser {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  subscription: IStripeSubscription;
}

interface IStripeSubscription {
  id: string;
  pid: string;
  customerPid: string;
  active: boolean;
  subscriber: User;
  plan: IStripePlan;
  inactiveReason: {
    cause: string;
    requiresActionSecret: string;
  };
}

interface IStripePlan {
  id: string;
  pid: string;
  slug: string;
  amount: number;
  product: IStripeProduct;
}

interface IStripeProduct {
  id: string;
  pid: string;
  slug: string;
  name: string;
  plans: {
    nodes: IStripePlan[];
  };
}

/**
 * A single redirect rule configuration.
 */
interface IRedirect {
  paths: string[]; // The paths that should obey this rule. The current path is checked against each string in this array to see if it starts with it. So including a string `/blog` in this array will ensure all paths that begin with `/blog` obey this rule.
  redirect: string; // Where the visitor should be redirected.
}

interface IMidtypeActionRef {
  id: string; // The name of the action that Midtype is trying to perform.
  el: HTMLElement; // The DOM element with an HTML tag that triggered the action.
  field?: string; // Optional. Provides extra context about the field or child element that caused an error.
}

interface IMidtypeActionMetadata {
  id: string;
  description?: string;
}

interface IActions {
  logout: () => void;
  verifyEmail: (input: IVerifyEmailInput) => Promise<undefined>;
  signup: (input: ISignupInput) => Promise<undefined>;
  login: (input: ILoginInput) => Promise<string>;
  loginGoogle: () => void;
  forgotPassword: (input: IVerifyEmailInput) => Promise<undefined>;
  resetPassword: (input: IResetPasswordInput) => Promise<undefined>;
  subscribe: (input: ISubscribeInput) => Promise<undefined>;
}

interface ILoginInput {
  email: string;
  password: string;
}

interface IVerifyEmailInput {
  email: string;
  confirmUserUrl: string;
}

interface ISignupInput {
  name: string;
  password: string;
  passwordConfirm?: string;
}

interface IResetPasswordInput {
  password: string;
  passwordConfirm?: string;
}

interface ISubscribeInput {
  token: string;
  plan: string;
  coupon?: string;
}
