import client from './apollo/client';
import { singleton } from './constants/identifiers';
import { handleData } from './lib/data';
import { handleForms, handleActionForms, handleActions } from './lib/forms';
import { enableStripe } from './lib/subscription';
import { getUser } from './lib/user';
import { getJWT } from './utils/jwt';
import { getQueries } from './utils/queries';

const attachHandlers = () => {
  handleActions();
  handleActionForms();
  if (getJWT()) {
    handleData();
    handleForms();
  }
};

singleton.init = (config: IUniverseConfig) => {
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

  // Checks if there is a JWT or confirm email token in the URL and if so, saves to local storage.
  getQueries();

  // Saves the provided config file to the global window object.
  singleton.config = config;

  // If the provided config file includes Stripe details, automatically look for Stripe forms on the page.
  if (config.stripe) {
    enableStripe(config.stripe);
  }

  singleton.client = client(config.projectName);
  getUser();
  attachHandlers();
};
