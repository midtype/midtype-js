import React from 'react';
import styled from 'styled-components';

import * as colors from '../constants/colors';
import { singleton } from '../constants/identifiers';

interface IProps {
  title?: string;
}

const Styled = styled.div`
  position: relative;
  width: 24rem;
  padding: 3rem 2rem;
  padding-bottom: 5rem;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 1px 0 rgba(8, 11, 14, 0.06),
    0 32px 40px -1px rgba(8, 11, 14, 0.1);
  h3 {
    margin-bottom: 2rem;
  }
  .login__google img {
    width: 10rem;
  }
  .login__powered-by {
    position: absolute;
    width: 100%;
    padding: 1rem;
    left: 0;
    bottom: 0;
    background: ${colors.GRAY_1()};
  }
  .login__powered-by p {
    color: ${colors.GRAY_3()};
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.6rem;
    text-align: center;
  }
`;

const Logo: React.FC<IProps> = props => {
  return (
    <Styled>
      <h3>{props.title || 'Login'}</h3>
      <div className="login__google">
        <a
          href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=310346463088-u5mebbn91d619r4poms613jvssm1gevn.apps.googleusercontent.com&redirect_uri=https://api.midtype.com/login&access_type=offline&state=id%3D${
            singleton.config.projectId
          }%26redirect%3D${escape(
            singleton.config.redirectUrl
          )}&scope=profile%20email`}
        >
          <img
            src="https://storage.googleapis.com/midtype-assets-staging/google-sign-in.png"
            alt="Google sign in link."
          />
        </a>
      </div>
      <div className="login__powered-by">
        <p>
          Powered By <strong>Midtype</strong>
        </p>
      </div>
    </Styled>
  );
};

export default Logo;
