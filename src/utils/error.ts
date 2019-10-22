import { singleton } from '../constants/identifiers';

const ERROR_CLASSNAME = 'mt-error-visible';
const ERROR_FORMATTED: { [key: string]: string } = {
  'authentication failure': 'Invalid username or password.'
};

const parseError = (e: string) => {
  let formatted = e;
  if (e.indexOf('GraphQL error: ') === 0) {
    formatted = e.split('GraphQL error: ')[1];
  }
  if (e.indexOf('Network error: ') === 0) {
    formatted = e.split('Network error: ')[1];
  }
  return ERROR_FORMATTED[formatted] || formatted;
};

const handleError = (action: IMidtypeActionRef, error?: Error | string) => {
  if (!error) {
    if (!action.el.dataset.mtError) {
      return;
    }
    const errorEl = document.querySelector<HTMLElement>(
      action.el.dataset.mtError
    );
    if (!errorEl) {
      return;
    }
    errorEl.classList.remove(ERROR_CLASSNAME);
    errorEl.textContent = '';
    return;
  }
  const e = typeof error === 'string' ? new Error(error) : error;
  if (singleton.config.onError) {
    singleton.config.onError(action, e);
  }
  if (!action.el.dataset.mtError) {
    return;
  }
  const errorEl = document.querySelector<HTMLElement>(
    action.el.dataset.mtError
  );
  if (!errorEl) {
    return;
  }
  errorEl.classList.add(ERROR_CLASSNAME);
  errorEl.textContent = parseError(e.message);
};

export default handleError;
