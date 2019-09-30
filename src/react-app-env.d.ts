/// <reference types="react-scripts" />

interface IUniverseConfig {
  projectName: string;
  projectId: number;
  redirectUrl: string;
  stripe?: IStripeConfig;
}

interface IStripeConfig {
  pk: string;
  options?: any;
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
