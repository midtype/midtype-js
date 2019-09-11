import qs from 'query-string';

const STORAGE_KEY = `__mt:jwt`;

export const checkJWT = () => {
  const parsed = qs.parseUrl(window.location.href);
  if (parsed.query.jwt) {
    setJWT(parsed.query.jwt as string);
    window.location.assign('/');
  }
};

export const setJWT = (jwt: string) => {
  window.localStorage.setItem(STORAGE_KEY, jwt);
};

export const getJWT = (): string | null => {
  return window.localStorage.getItem(STORAGE_KEY);
};

export const clearJWT = (): void => {
  window.localStorage.removeItem(STORAGE_KEY);
  window.location.assign('/');
};
