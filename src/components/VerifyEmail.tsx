import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import Input from './elements/Input';
import Button from './elements/Button';
import NoProvider from './NoProvider';

import { MidtypeContext, IMidtypeContext } from './Provider';

interface IProps {
  confirmUserUrl: string;
  title?: string;
}

const Styled = styled.div`
  .signup__title {
    margin-bottom: 20px;
  }
  .signup__powered p {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: gray;
  }
  .signup__form {
    text-align: left;
    position: relative;
    margin-bottom: 60px;
  }
  .signup__form__group {
    text-align: left;
    display: flex;
    margin-bottom: 18px;
    margin-top: 10px;
  }
  .signup__form__group button {
    margin-left: 10px;
    flex: 0 0 100px;
  }
  .signup__form__message {
    position: absolute;
    top: 100%;
    padding-top: 12px;
    font-size: 12px;
    transition: 250ms all;
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    transform: translateY(10px);
    opacity: 0;
    visibility: hidden;
  }
  .signup__form__message--visible {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
`;

const VerifyEmail: React.FC<IProps & IMidtypeContext> = props => {
  const { title, confirmUserUrl, actions } = props;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      setLoading(true);
      try {
        await actions.verifyEmail({
          email,
          confirmUserUrl
        });
        setSubmitted(true);
      } catch {}
      setLoading(false);
    },
    [setLoading, actions, email, confirmUserUrl]
  );

  return (
    <Styled className="midtype-element" id="mtVerifyEmail">
      <h3 className="signup__title">{title || 'Sign Up'}</h3>
      <form className="signup__form" onSubmit={onSubmit}>
        <label>Email</label>
        <div className="signup__form__group">
          <Input
            value={email}
            onChange={e => setEmail(e)}
            inputProps={{ placeholder: 'Enter your email...' }}
          />
          <Button loading={loading} onClick={onSubmit}>
            Sign Up
          </Button>
        </div>
        <div
          className={`signup__form__message signup__form__message--${
            submitted ? 'visible' : 'hidden'
          }`}
        >
          <span role="img" aria-label="Hooray!">
            🎉
          </span>{' '}
          Check your email for a verification code to complete signup!
        </div>
      </form>

      <div className="signup__powered">
        <p>
          Powered By <strong>Midtype</strong>
        </p>
      </div>
    </Styled>
  );
};

const WithContext: React.FC<IProps> = props => (
  <MidtypeContext.Consumer>
    {context =>
      context ? <VerifyEmail {...props} {...context} /> : <NoProvider />
    }
  </MidtypeContext.Consumer>
);

export default WithContext;
