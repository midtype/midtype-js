import md5 from 'md5';

import Midtype from '../singleton';
import { STORAGE_CONFIRM_TOKEN } from '../../constants/identifiers';
import { get, clear } from '../../utils/store';

import { getJWT, setJWT, clearJWT } from '../../utils/jwt';
import VERIFY_EMAIL, {
  IVerifyEmail,
  IVerifyEmailVariables
} from '../../apollo/mutations/verifyEmail';
import AUTHENTICATE, {
  IAuthenticate,
  IAuthenticateVariables
} from '../../apollo/mutations/authenticate';
import SIGNUP, {
  ISignup,
  ISignupVariables
} from '../../apollo/mutations/signup';
import RESET_PASSWORD, {
  IResetPassword,
  IResetPasswordVariables
} from '../../apollo/mutations/resetPassword';
import CREATE_SUBSCRIPTION, {
  ICreateSubscription,
  ICreateSubscriptionVariables
} from '../../apollo/mutations/createSubscription';
import { GET_CURRENT_USER } from '../../apollo/queries/currentUser';

import { initIntrospect } from './introspect';

export const initActions = (midtype: Midtype): IActions => {
  const { client, config } = midtype;

  const logout = () => clearJWT();

  const introspect = initIntrospect(client);

  const getUser = async () => {
    if (getJWT()) {
      const { data } = await client.query({
        query: GET_CURRENT_USER
      });
      midtype.user = data.mUserInSession;
      return data.mUserInSession;
    }
  };

  const verifyEmail = async (input: IVerifyEmailInput) => {
    const { email, confirmUserUrl: url } = input;
    return client.mutate<IVerifyEmail, IVerifyEmailVariables>({
      mutation: VERIFY_EMAIL,
      variables: { email, url }
    });
  };

  const signup = async (input: ISignupInput) => {
    const { name, password, passwordConfirm } = input;
    if (!name) {
      return Promise.reject(`No name provider for user.`);
    }

    if (!password) {
      return Promise.reject(`No password provider for user.`);
    }

    const match = passwordConfirm ? passwordConfirm === password : true;
    if (!match) {
      return Promise.reject(`Password and confirm password do not match.`);
    }

    const token = input.token || get(STORAGE_CONFIRM_TOKEN);
    if (!token) {
      return Promise.reject(`No confirmation token saved to local storage.`);
    }

    const variables = { name, password: md5(password), token };
    return client
      .mutate<ISignup, ISignupVariables>({ mutation: SIGNUP, variables })
      .then(({ data }) => {
        const { jwtToken } = data.createMUser;
        setJWT(jwtToken);
        return Promise.resolve(jwtToken);
      })
      .finally(() => clear(STORAGE_CONFIRM_TOKEN));
  };

  const login = async (input: ILoginInput) => {
    const { email, password } = input;
    if (!email) {
      return Promise.reject(`No email provided to login.`);
    }

    if (!password) {
      return Promise.reject(`No password provided for user.`);
    }

    const variables = { email, password: md5(password) };
    return client
      .mutate<IAuthenticate, IAuthenticateVariables>({
        mutation: AUTHENTICATE,
        variables
      })
      .then(({ data }) => {
        const { jwtToken } = data.mAuthenticate;
        setJWT(jwtToken);
        return getUser();
      });
  };

  const loginGoogle = async () => {
    const SIGN_IN_LINK = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=310346463088-u5mebbn91d619r4poms613jvssm1gevn.apps.googleusercontent.com&redirect_uri=https://api-staging.midtype.com/login&access_type=offline&state=name%3D${config.projectId}%26redirect%3D${config.redirectUrl}&scope=profile%20email`;
    window.location.assign(SIGN_IN_LINK);
  };

  const forgotPassword = async (input: IVerifyEmailInput) => {
    const { email, confirmUserUrl: url } = input;
    if (!email) {
      return Promise.reject(`No email provided for user who forgot password.`);
    }

    if (!url) {
      return Promise.reject(
        `No confirmation URL provided for forgot password flow.`
      );
    }

    return client.mutate<IVerifyEmail, IVerifyEmailVariables>({
      mutation: VERIFY_EMAIL,
      variables: { email, url, toResetPassword: true }
    });
  };

  const resetPassword = async (input: IResetPasswordInput) => {
    const { password, passwordConfirm } = input;
    if (!password) {
      return Promise.reject(`No new password provided.`);
    }

    const match = passwordConfirm ? passwordConfirm === password : true;
    if (!match) {
      return Promise.reject(`Password and confirm password do not match.`);
    }

    const token = get(STORAGE_CONFIRM_TOKEN);
    if (!token) {
      return Promise.reject(`No confirmation token saved to local storage.`);
    }

    const variables = {
      newPassword: md5(password),
      token
    };
    return client
      .mutate<IResetPassword, IResetPasswordVariables>({
        mutation: RESET_PASSWORD,
        variables
      })
      .finally(() => clear(STORAGE_CONFIRM_TOKEN));
  };

  const subscribe = (input: ISubscribeInput) => {
    const { token, plan, coupon } = input;
    if (!token) {
      return Promise.reject(`No Stripe credit card token provided.`);
    }

    if (!plan) {
      return Promise.reject(`No Stripe plan ID provided.`);
    }
    const variables = { plan, token, coupon };
    return client
      .mutate<ICreateSubscription, ICreateSubscriptionVariables>({
        mutation: CREATE_SUBSCRIPTION,
        variables
      })
      .then(({ data }) => Promise.resolve(data.mStripeSubscription));
  };

  return {
    introspect,
    logout,
    verifyEmail,
    getUser,
    signup,
    login,
    loginGoogle,
    forgotPassword,
    resetPassword,
    subscribe
  };
};
