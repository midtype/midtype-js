import { clearJWT, getJWT } from '../utils/jwt';
import { ApolloClient } from 'apollo-boost';

import { enableStripe } from '../lib/subscription';
import { Midtype } from '../lib/singleton';

export const ROOT_ELEMENT_ID = 'midtype';

interface MidtypeObject {
  refresh: () => void;
  init: (config: IMidtypeConfig) => void;
  enableStripe: (config: IStripeConfig) => void;
  getJWT: () => string | null;
  logout: () => void;
  openLogin: () => void;
  fetch: (body: any) => Promise<any>;
  endpoint: string;
  client: ApolloClient<any>;
  config: IMidtypeConfig;
  data: {
    user?: {
      id: string;
      name: string;
      email: string;
    };
    [key: string]: any;
  };
}

const WINDOW_OBJECT_ID = 'Midtype';
(window as any)[WINDOW_OBJECT_ID] = {
  logout: clearJWT,
  getJWT,
  enableStripe,
  data: {}
};
export const singleton: MidtypeObject = (window as any)[WINDOW_OBJECT_ID];

(window as any)['mt'] = {
  init: (config: IMidtypeConfig) => {
    (window as any)['mt'] = new Midtype(config);
  }
};

export const STORAGE_CONFIRM_TOKEN = 'token';
