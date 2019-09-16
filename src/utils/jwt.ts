const STORAGE_KEY = `__mt:jwt`;

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
