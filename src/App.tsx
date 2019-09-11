import React, { useState } from 'react';
import styled from 'styled-components';

import Login from './components/LoginModal';
import { singleton } from './constants/identifiers';

const Styled = styled.div`
  margin: 0;
  font-family: Avenir, Helvetica, sans-serif, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  * {
    box-sizing: border-box;
  }

  p,
  input,
  textarea {
    margin: 0;
    font-size: 1rem;
    line-height: 1.2rem;
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

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  a,
  button {
    font-family: Avenir, Helvetica, sans-serif, Arial, sans-serif;
    text-decoration: none;
    cursor: pointer;
    border: 0;
    outline: none;
    padding: 0;
    font-size: inherit;
    color: blue;
    background: none;
    cursor: pointer;
  }

  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const App: React.FC = () => {
  const [login, setLogin] = useState(false);
  singleton.openLogin = () => setLogin(true);

  return (
    <Styled>
      <Login open={login} onClickClose={() => setLogin(false)} />
    </Styled>
  );
};

export default App;
