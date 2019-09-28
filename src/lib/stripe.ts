import { singleton } from '../constants/identifiers';
import CREATE_SUBSCRIPTION from '../apollo/mutations/createSubscription';
import logger from '../utils/logger';

export const subscribe = (el: HTMLFormElement) => {
  // Throw error if stripe.js not included on the page.
  if (!(window as any).Stripe) {
    logger.err('stripe.js has not been included on this page.');
    return;
  }

  // Ensure that a Stripe publishable key has been supplied.
  const { stripe: config } = singleton.config;
  if (!config || !config.pk) {
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
  const stripe = (window as any).Stripe(config.pk);
  const elements = stripe.elements();
  const card = elements.create('card', config.options);
  card.mount(cardEl);

  // Grab all the other possible inputs to a subscription form
  const coupon = el.querySelector<HTMLInputElement>(
    '[data-mt-action-form-field="coupon"]'
  );

  const plan = el.dataset.mtFormId;
  const run = async () => {
    stripe.createToken(card).then(async (res: any) => {
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
      }
    });
  };
  const submit = el.querySelector<HTMLElement>('input[type="submit"]');
  if (!submit) {
    logger.err('Subscription form must include <input type="submit"> button.');
    return;
  }
  submit.addEventListener('click', e => {
    run();
    e.preventDefault();
  });
};
