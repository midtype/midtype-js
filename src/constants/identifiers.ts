import { clearJWT, getJWT } from '../utils/jwt';
import { ApolloClient } from 'apollo-boost';

export const ROOT_ELEMENT_ID = 'midtype';

interface MidtypeObject {
  init: (config: IUniverseConfig) => void;
  getJWT: () => string | null;
  logout: () => void;
  openLogin: () => void;
  client: ApolloClient<any>;
  config: IUniverseConfig;
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
  data: {}
};
export const singleton: MidtypeObject = (window as any)[WINDOW_OBJECT_ID];

export const STORAGE_CONFIRM_TOKEN = 'token';
