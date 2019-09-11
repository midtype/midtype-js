import ApolloClient from 'apollo-boost';

import { getJWT, clearJWT } from '../utils/jwt';

const client = (midtypeId: string) =>
  new ApolloClient({
    uri: `https://${midtypeId}.midtype.dev/graphql`,
    request: operation => {
      operation.setContext(() => {
        // On every request to the API, retrieve the JWT from local storage.
        const jwt = getJWT();

        // If the JWT exists, include it in the `Authorization` header.
        // If not, don't include the `Authorization` header at all.
        return {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
        };
      });
      return Promise.resolve();
    },
    onError: obj => {
      if (obj.networkError && (obj.networkError as any).statusCode) {
        const code = (obj.networkError as any).statusCode;
        if (code === 401 || code === 403) {
          clearJWT();
        }
      }
    }
  });

export default client;
