import React from 'react';
import { createGlobalStyle } from 'styled-components';

import VerifyEmail from './components/VerifyEmail';
import Login from './components/Login';

const Styles = createGlobalStyle`
  .midtype-element {
    font-family: Avenir, Helvetica, sans-serif, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    padding: 30px;
    text-align: center;


    * {
      box-sizing: border-box;
    }

    p,
    input,
    textarea {
      margin: 0;
      font-family: Avenir, Helvetica, sans-serif, Arial, sans-serif;
    }

    h1,
    h2,
    h3,
    h4,
    h5 {
      margin: 0;
      padding: 0;
      font-weight: 500;
    }

    button,
    a {
      font-family: Avenir, Helvetica, sans-serif, Arial, sans-serif;
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
    }

    label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    ul,
    li {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }
`;

const App: React.FC = () => {
  return (
    <React.Fragment>
      <VerifyEmail confirmUserUrl="http://localhost:3000/login" />
      <Login />
      <Styles />
    </React.Fragment>
  );
};

export default App;
