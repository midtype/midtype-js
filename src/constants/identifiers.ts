import { clearJWT } from '../utils/jwt';
import { ApolloClient } from 'apollo-boost';

export const ROOT_ELEMENT_ID = 'midtype';

interface MidtypeObject {
  init: (config: IUniverseConfig) => void;
  logout: () => void;
  openLogin: () => void;
  client: ApolloClient<any>;
  config: IUniverseConfig;
  data: {
    confirmToken?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const WINDOW_OBJECT_ID = 'Midtype';
(window as any)[WINDOW_OBJECT_ID] = {
  logout: clearJWT,
  data: {}
};
export const singleton: MidtypeObject = (window as any)[WINDOW_OBJECT_ID];

export const STORAGE_CONFIRM_TOKEN = 'token';
