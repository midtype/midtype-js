import client from './apollo/client';
import { singleton } from './constants/identifiers';
import { handleData } from './lib/data';
import { handleForms, handleActionForms, handleActions } from './lib/forms';
import { handleRedirects } from './lib/redirects';
import { enableStripe } from './lib/subscription';
import { getUser } from './lib/user';
import { getJWT } from './utils/jwt';
import { getQueries } from './utils/queries';

const attachHandlers = () => {
  getUser();
  handleActions();
  handleActionForms();
  if (getJWT()) {
    handleData();
    handleForms();
  }
};

const init = (config: IMidtypeConfig) => {
  if (config.stripe) {
    enableStripe(config.stripe);
  }
  attachHandlers();
};

singleton.init = (config: IMidtypeConfig) => {
  if (!config.projectId) {
    throw new Error(
      'Midtype package cannot be initiated without a valid Midtype Project ID.'
    );
  }

  if (!config.projectName) {
    throw new Error(
      'Midtype package cannot be initiated without a valid Midtype Project name.'
    );
  }

  // Compute API endpoint and instantiate Apollo client for our user later.
  const ENDPOINT = `https://${config.projectName}.midtype.dev/graphql`;
  singleton.client = client(ENDPOINT);
  singleton.endpoint = ENDPOINT;
  singleton.fetch = (body: any) =>
    fetch(ENDPOINT, {
      headers: {
        authorization: `Bearer ${getJWT()}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
      method: 'POST'
    }).then(res => res.json());

  // Saves the provided config file to the global window object.
  singleton.config = config;

  // Saves the refresh function to fetch/re-render data so client can call it as needed.
  singleton.refresh = () => init(config);

  // Check if we need to redirect this URL.
  handleRedirects();

  // Checks if there is a JWT or confirm email token in the URL and if so, saves to local storage.
  getQueries();

  if (document.readyState === 'complete') {
    init(config);
  } else {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        init(config);
      }
    };
  }
};
