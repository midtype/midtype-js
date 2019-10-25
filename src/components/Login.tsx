import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import Input from './elements/Input';
import Button from './elements/Button';
import NoProvider from './NoProvider';

import { MidtypeContext, IMidtypeContext } from './Provider';

interface IProps {
  redirectUrl?: string;
  title?: string;
}

const Styled = styled.div`
  .login__title {
    margin-bottom: 20px;
  }
  .login__powered p {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: gray;
  }
  .login__form {
    text-align: left;
    position: relative;
    margin-bottom: 30px;
  }
  .login__form__group {
    text-align: left;
    margin-top: 10px;
    margin-bottom: 20px;
  }
  .login__form__group input {
    margin-top: 10px;
  }
  .login__form__footer {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .login__form__footer__message {
    margin-left: 20px;
    font-size: 12px;
    transition: 250ms all;

    transform: translateY(10px);
    opacity: 0;
    visibility: hidden;
  }
  .login__form__footer__message--visible {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
`;

const Login: React.FC<IProps & IMidtypeContext> = props => {
  const { title, redirectUrl, actions, user, update } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      setLoading(true);
      try {
        await actions.login({ email, password });
        if (redirectUrl) {
          window.history.go(redirectUrl as any);
        } else {
          update();
          setSubmitted(true);
        }
      } catch {}
      setLoading(false);
    },
    [setLoading, actions, email, password, redirectUrl, update]
  );

  return (
    <Styled className="midtype-element" id="mtLogin">
      <h3 className="login__title">{title || 'Login'}</h3>
      <form className="login__form" onSubmit={onSubmit}>
        <div className="login__form__group">
          <label>Email</label>
          <Input
            value={email}
            onChange={e => setEmail(e)}
            inputProps={{ placeholder: 'Enter your email' }}
          />
        </div>
        <div className="login__form__group">
          <label>Password</label>
          <Input
            value={password}
            onChange={e => setPassword(e)}
            inputProps={{
              placeholder: 'Enter your password.',
              type: 'password'
            }}
          />
        </div>
        <div className="login__form__footer">
          <Button loading={loading} onClick={onSubmit}>
            Login
          </Button>
          <div
            className={`login__form__footer__message login__form__footer__message--${
              submitted ? 'visible' : 'hidden'
            }`}
          >
            <span role="img" aria-label="Hooray!">
              🎉
            </span>
            Congrats
            {user ? <strong> {user.private.name}, </strong> : ', '}
            you're logged in.
          </div>
        </div>
      </form>

      <div className="login__powered">
        <p>
          Powered By <strong>Midtype</strong>
        </p>
      </div>
    </Styled>
  );
};

const WithContext: React.FC<IProps> = props => (
  <MidtypeContext.Consumer>
    {context => (context ? <Login {...props} {...context} /> : <NoProvider />)}
  </MidtypeContext.Consumer>
);

export default WithContext;
