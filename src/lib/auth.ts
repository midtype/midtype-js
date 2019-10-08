import md5 from 'md5';
import { gql } from 'apollo-boost';

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
  if (!confirmUserUrl) {
    const res = await singleton.client.query<IConfirmUserUrls>({
      query: GET_CONFIRM_USER_URLS
    });
    if (res.data && res.data.mSetting && res.data.mSetting.value.length) {
      confirmUserUrl = res.data.mSetting.value[0];
    }
  }

  const run = () => {
    singleton.client
      .mutate<IVerifyEmail, IVerifyEmailVariables>({
        mutation: VERIFY_EMAIL,
        variables: { email: email.value, url: confirmUserUrl }
      })
      .then(() => postSubmitAction(el))
      .catch(() => null);
  };
  submitForm(el, run, 'User email verification form');
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

  if (!pw) {
    logger.err(`No password input in create user form.`);
    return;
  }

  const metadata = el.querySelector<HTMLElement>('[data-mt-action-form-model]');
  const handleMetadata = metadata
    ? parseForm(metadata, 'action-form', metadata.dataset.mtActionFormModel)
    : () => null;
  const run = () => {
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
      singleton.client
        .mutate({ mutation, variables })
        .then(res => {
          if (
            res.data &&
            res.data.createMUser &&
            res.data.createMUser.jwtToken
          ) {
            setJWT(res.data.createMUser.jwtToken);
            clear(STORAGE_CONFIRM_TOKEN);
            return getUser();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          handleMetadata();
        })
        .then(() => postSubmitAction(el))
        .catch(e => {
          clear(STORAGE_CONFIRM_TOKEN);
          logger.err(e);
        });
    }
  };
  submitForm(el, run, 'Create user form');
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
    singleton.client
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
      .then(() => postSubmitAction(el))
      .catch(e => logger.err(e));
  };
  submitForm(el, run, 'Login form');
};
