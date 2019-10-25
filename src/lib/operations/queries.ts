import { ApolloClient } from 'apollo-client';
import { upperCaseFirst } from 'change-case';
import pluralize from 'pluralize';

import { singularize, single, multiple } from '../../utils/queryConstructor';

export const initQuery = (
  model: string,
  schema: ISchema,
  client: ApolloClient<any>
) => async (id: string, fields: string[]) => {
  if (!fields) {
    return Promise.reject(
      `Provide an array of strings to this function to select which fields you'd like to fetch for a single record of model '${model}'.`
    );
  }
  if (!id) {
    return Promise.reject(
      `To query a single record of model '${model}' you must provide an 'id'.`
    );
  }
  const singular = singularize(model);
  if (schema.complete && !schema.models[upperCaseFirst(singular)]) {
    return Promise.reject(
      `The model '${singular}' doesn't exist in your Midtype project.`
    );
  }
  const query = single(singular, fields);
  try {
    const { data } = await client.query({ query, variables: { id } });
    return Promise.resolve(data[singular]);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const initQueryAll = (
  model: string,
  schema: ISchema,
  client: ApolloClient<any>
) => async (fields: string[]) => {
  if (!fields) {
    return Promise.reject(
      `Provide an array of strings to this function to select which fields you'd like to fetch for records of model '${model}'.`
    );
  }
  if (schema.complete && !schema.models[upperCaseFirst(singularize(model))]) {
    return Promise.reject(
      `The model '${singularize(model)}' doesn't exist in your Midtype project.`
    );
  }
  const plural = pluralize(model);
  const query = multiple(plural, fields);
  try {
    const { data } = await client.query({ query });
    return Promise.resolve(data[plural].nodes);
  } catch (e) {
    return Promise.reject(e);
  }
};
