import md5 from 'md5';
import gql from 'graphql-tag';

import { singleton, STORAGE_CONFIRM_TOKEN } from '../constants/identifiers';
import { getUser } from './user';

import {
  parseSettings,
  postSubmitAction,
  parseForm,
  submitForm
} from '../utils/dom';
import { get, clear } from '../utils/store';
import { setJWT } from '../utils/jwt';

import logger from '../utils/logger';
import actions from '../constants/actions';

import GET_CONFIRM_USER_URLS, {
  IConfirmUserUrls
} from '../apollo/queries/getConfirmUserUrls';
import VERIFY_EMAIL, {
  IVerifyEmail,
  IVerifyEmailVariables
} from '../apollo/mutations/verifyEmail';

export const verifyEmail = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );

  if (!email) {
    logger.err(
      `User email verification forms must include an input for the email field.`
    );
    return;
  }

  let { confirmUserUrl } = parseSettings(el);
  if (el.dataset.mtSettingConfirmUserUrl) {
    confirmUserUrl = el.dataset.mtSettingConfirmUserUrl;
  }
  if (!confirmUserUrl) {
    const res = await singleton.client.query<IConfirmUserUrls>({
      query: GET_CONFIRM_USER_URLS
    });
    if (res.data && res.data.mSetting && res.data.mSetting.value.length) {
      confirmUserUrl = res.data.mSetting.value[0];
    }
  }

  const run = () =>
    singleton.client
      .mutate<IVerifyEmail, IVerifyEmailVariables>({
        mutation: VERIFY_EMAIL,
        variables: { email: email.value, url: confirmUserUrl }
      })
      .then(() => postSubmitAction(el));

  submitForm(el, run, actions.VERIFY_EMAIL);
};

export const signup = async (el: HTMLElement) => {
  const name = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="name"]'
  );
  const pw = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="password"]'
  );
  const pwConfirm = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="passwordConfirm"]'
  );
  const metadata = el.querySelector<HTMLElement>('[data-mt-action-form-model]');
  const handleMetadata = metadata
    ? parseForm(metadata, 'action-form', metadata.dataset.mtActionFormModel)
    : () => null;
  const run = () => {
    if (!pw) {
      return Promise.reject(`No password input in create user form.`);
    }
    const match = pwConfirm ? pwConfirm.value === pw.value : true;
    if (match && name) {
      const mutation = gql`
        mutation CreateUser(
          $name: String!
          $token: String!
          $password: String!
        ) {
          createMUser(
            input: { name: $name, token: $token, password: $password }
          ) {
            jwtToken
          }
        }
      `;
      const variables = {
        name: name.value,
        password: md5(pw.value),
        token: get(STORAGE_CONFIRM_TOKEN)
      };
      return singleton.client
        .mutate({ mutation, variables })
        .then(res => {
          if (
            res.data &&
            res.data.createMUser &&
            res.data.createMUser.jwtToken
          ) {
            setJWT(res.data.createMUser.jwtToken);
            return getUser();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          handleMetadata();
        })
        .then(() => postSubmitAction(el))
        .catch(e => Promise.reject(e))
        .finally(() => clear(STORAGE_CONFIRM_TOKEN));
    }
    return Promise.reject(new Error(`Password confirmation does't match.`));
  };
  submitForm(el, run, actions.SIGNUP);
};

export const login = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );
  const pw = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="password"]'
  );
  if (!pw || !email) {
    logger.err(`No password input in Login form.`);
    return;
  }

  const run = () => {
    const mutation = gql`
      mutation Authenticate($email: String!, $password: String!) {
        mAuthenticate(input: { email: $email, password: $password }) {
          jwtToken
        }
      }
    `;
    const variables = {
      email: email.value,
      password: md5(pw.value)
    };
    return singleton.client
      .mutate({ mutation, variables })
      .then(res => {
        if (
          res.data &&
          res.data.mAuthenticate &&
          res.data.mAuthenticate.jwtToken
        ) {
          setJWT(res.data.mAuthenticate.jwtToken);
          return getUser();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => postSubmitAction(el));
  };
  submitForm(el, run, actions.LOGIN);
};

export const forgotPassword = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );

  if (!email) {
    logger.err(
      `Forgot password forms must include an input for the email field.`
    );
    return;
  }

  let { confirmUserUrl } = parseSettings(el);
  if (el.dataset.mtSettingConfirmUserUrl) {
    confirmUserUrl = el.dataset.mtSettingConfirmUserUrl;
  }
  if (!confirmUserUrl) {
    const res = await singleton.client.query<IConfirmUserUrls>({
      query: GET_CONFIRM_USER_URLS
    });
    if (res.data && res.data.mSetting && res.data.mSetting.value.length) {
      confirmUserUrl = res.data.mSetting.value[0];
    }
  }

  const run = () => {
    return singleton.client
      .mutate<IVerifyEmail, IVerifyEmailVariables>({
        mutation: VERIFY_EMAIL,
        variables: {
          email: email.value,
          url: confirmUserUrl,
          toResetPassword: true
        }
      })
      .then(() => postSubmitAction(el))
      .catch(() => null);
  };
  submitForm(el, run, actions.FORGOT_PASSWORD);
};

export const resetPassword = async (el: HTMLElement) => {
  const pw = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="password"]'
  );
  const pwConfirm = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="passwordConfirm"]'
  );

  if (!pw) {
    logger.err(`No password input in reset password form.`);
    return;
  }
  const run = () => {
    const match = pwConfirm ? pwConfirm.value === pw.value : true;
    if (match) {
      const mutation = gql`
        mutation ResetPassword($token: String!, $newPassword: String!) {
          mChangePassword(input: { token: $token, newPassword: $newPassword }) {
            success
          }
        }
      `;
      const variables = {
        newPassword: md5(pw.value),
        token: get(STORAGE_CONFIRM_TOKEN)
      };
      return singleton.client
        .mutate({ mutation, variables })
        .then(() => postSubmitAction(el))
        .finally(() => clear(STORAGE_CONFIRM_TOKEN));
    }
    return Promise.reject('Password and confirm password do not match.');
  };
  submitForm(el, run, actions.RESET_PASSWORD);
};
