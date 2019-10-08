import * as store from './store';

const STORAGE_JWT = 'jwt';

export const setJWT = (jwt: string) => {
  store.set(STORAGE_JWT, jwt);
};

export const getJWT = (): string | null => store.get(STORAGE_JWT);

export const clearJWT = () => store.clear(STORAGE_JWT, '/');
