const keyToStore = (key: string) => `__mt:${key}`;

export const set = (key: string, value: any) => {
  window.localStorage.setItem(keyToStore(key), JSON.stringify(value));
};

export const get = (key: string): any => {
  const value = window.localStorage.getItem(keyToStore(key));
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    clear(keyToStore(key));
  }
  return null;
};

export const clear = (key: string, redirect?: string) => {
  window.localStorage.removeItem(keyToStore(key));
  if (redirect === 'reload') {
    window.location.reload();
  } else if (redirect) {
    window.location.assign(redirect);
  }
};
