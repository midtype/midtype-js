import { singleton } from '../constants/identifiers';
import CREATE_SUBSCRIPTION from '../apollo/mutations/createSubscription';

import logger from '../utils/logger';
import handleError from '../utils/error';
import { submitForm, postSubmitAction } from '../utils/dom';
import actions from '../constants/actions';

export const enableStripe = (config: IStripeConfig) => {
  singleton.data.stripe = config;
  const stripeForm = document.querySelector<HTMLFormElement>(
    'form[data-mt-action-form="subscribe"]'
  );
  if (stripeForm) {
    subscribe(stripeForm, config);
  } else {
    logger.warn('No Stripe payment forms found on this page.');
  }
};

export const subscribe = (el: HTMLFormElement, config?: IStripeConfig) => {
  // Throw error if stripe.js not included on the page.
  if (!(window as any).Stripe) {
    logger.err('stripe.js has not been included on this page.');
    return;
  }

  // Ensure that a Stripe publishable key has been supplied.
  const stripeConfig = config || singleton.config.stripe;
  if (!stripeConfig || !stripeConfig.pk) {
    logger.err(
      'Included subscription form without providing a valid Stripe publishable key.'
    );
    return;
  }

  // Ensure that the subscribe form has a card element in it.
  const cardEl = el.querySelector('[data-mt-action-form-field="creditCard"]');
  if (!cardEl) {
    logger.err('No credit card input supplied for subscription form.');
    return;
  }

  // Init Stripe and mount the card element on to the page.
  const stripe = (window as any).Stripe(stripeConfig.pk);
  const elements = stripe.elements();
  const card = elements.create('card', stripeConfig.options);
  card.mount(cardEl);

  // Show card errors in the error element if it's provided on the form
  const actionRef = {
    id: actions.SUBSCRIBE.id,
    el,
    field: 'creditCard'
  };
  card.addEventListener('change', (e: any) => {
    handleError(actionRef, e.error);
  });

  // Grab all the other possible inputs to a subscription form
  const coupon = el.querySelector<HTMLInputElement>(
    '[data-mt-action-form-field="coupon"]'
  );

  const plan = el.dataset.mtMutateId;
  const run = async () => {
    try {
      const res = await stripe.createToken(card);
      if (!res.error) {
        const variables = {
          plan,
          token: res.token.id,
          coupon: coupon && coupon.value ? coupon.value : undefined
        };
        await singleton.client.mutate({
          mutation: CREATE_SUBSCRIPTION,
          variables
        });
        postSubmitAction(el);
        return Promise.resolve();
      }
      return Promise.reject(new Error(res.error));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  submitForm(el, run, actions.SUBSCRIBE);
};
