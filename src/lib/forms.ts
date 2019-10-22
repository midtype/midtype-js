import { verifyEmail, signup, login, forgotPassword } from './auth';

import { singleton } from '../constants/identifiers';
import { parseForm, submitForm } from '../utils/dom';
import logger from '../utils/logger';

export const handleForms = async () =>
  document.querySelectorAll<HTMLFormElement>('[data-mt-mutate]').forEach(el => {
    const run = parseForm(el, 'mutate');
    submitForm(el, run, `${el.dataset.mtMutate} form`);
  });

export const handleActions = () => {
  document
    .querySelectorAll<HTMLButtonElement>(
      'button[data-mt-action], a[data-mt-action]'
    )
    .forEach(el => {
      switch (el.dataset.mtAction) {
        case 'login':
          el.addEventListener('click', singleton.openLogin);
          break;
        case 'logout':
          el.addEventListener('click', singleton.logout);
          break;
        default:
          logger.err(`Unrecognized Midtype action: ${el.dataset.mtAction}`);
      }
    });
};

export const handleActionForms = () => {
  document
    .querySelectorAll<HTMLFormElement>('form[data-mt-action-form]')
    .forEach(el => {
      switch (el.dataset.mtActionForm) {
        case 'verifyEmail':
          verifyEmail(el);
          break;
        case 'signup':
          signup(el);
          break;
        case 'login':
          login(el);
          break;
        case 'forgotPassword':
          forgotPassword(el);
          break;
        case 'subscribe':
          // Don't automatically handle Stripe form. Make user manually call it.
          break;
        default:
          logger.err(
            `Unrecognized Midtype action form: ${el.dataset.mtAction}`
          );
      }
    });
};
