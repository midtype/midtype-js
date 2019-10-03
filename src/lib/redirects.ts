import { getJWT } from '../utils/jwt';
import { singleton } from '../constants/identifiers';

export const handleRedirects = () => {
  const { config } = singleton;
  if (config && config.redirects) {
    if (getJWT() && config.redirects.signedIn) {
      config.redirects.signedIn.forEach(rule => {
        rule.paths.forEach(path => {
          if (window.location.pathname.indexOf(path) === 0) {
            window.location.assign(rule.redirect || '/');
          }
        });
      });
    } else if (!getJWT() && config.redirects.signedOut) {
      config.redirects.signedOut.forEach(rule => {
        rule.paths.forEach(path => {
          if (window.location.pathname.indexOf(path) === 0) {
            window.location.assign(rule.redirect || '/');
          }
        });
      });
    }
  }
};
