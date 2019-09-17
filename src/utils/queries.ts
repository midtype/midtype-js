import qs from 'query-string';

import { setJWT } from './jwt';
import { set } from './store';
import { STORAGE_CONFIRM_TOKEN } from '../constants/identifiers';

export const checkQueries = () => {
  const parsed = qs.parseUrl(window.location.href);
  let hasQuery = false;
  if (parsed.query.jwt) {
    setJWT(parsed.query.jwt as string);
    delete parsed.query.jwt;
    hasQuery = true;
  }
  if (parsed.query.token) {
    const token = parsed.query.token as string;
    set(STORAGE_CONFIRM_TOKEN, token);
    delete parsed.query.token;
    hasQuery = true;
  }
  if (hasQuery && window.history) {
    const { origin, pathname } = window.location;
    const search = qs.stringify(parsed.query);
    const url = `${origin}${pathname}${search ? `?${search}` : ''}`;
    window.history.pushState({}, window.document.title, url);
  }
};
