import React from 'react';
import ReactDOM from 'react-dom';

import Midtype from '../singleton';
import App from '../../App';
import MidtypeProvider from '../../components/Provider';

export const initReact = (mt: Midtype) => {
  ReactDOM.render(
    <MidtypeProvider>
      <App />
    </MidtypeProvider>,
    document.getElementById('root'),
    () => {
      replace('mt-signup', 'mtVerifyEmail');
      replace('mt-login', 'mtLogin');
    }
  );
};

const replace = (tag: string, el: string) => {
  const container = document.querySelector(tag);
  if (container) {
    (container.parentNode as any).replaceChild(
      document.querySelector(`#${el}`) as any,
      container
    );
  }
};
