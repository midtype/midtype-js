import { ApolloClient } from 'apollo-boost';
import { upperCaseFirst, pascal } from 'change-case';

import { singularize, update, create } from '../../utils/queryConstructor';

export const initCreate = (
  model: string,
  schema: ISchema,
  client: ApolloClient<any>
) => async (variables: any) => {
  if (!variables) {
    return Promise.reject(
      `Must supply variables for creating a new record of model '${model}'.`
    );
  }
  const singular = singularize(model);
  if (schema.complete && !schema.models[upperCaseFirst(singular)]) {
    return Promise.reject(
      `The model '${singular}' doesn't exist in your Midtype project.`
    );
  }
  const mutation = create(singular, variables, schema);
  try {
    const { data } = await client.mutate({ mutation, variables });
    return Promise.resolve(data[`create${pascal(singular)}`][singular]);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const initUpdate = (
  model: string,
  schema: ISchema,
  client: ApolloClient<any>
) => async (id: string, variables: any) => {
  if (!id) {
    return Promise.reject(
      `To update a record of model '${model}' you must provide an 'id' for the record.`
    );
  }
  if (!variables) {
    return Promise.reject(
      `Must supply variables for updating a record of model '${model}'.`
    );
  }
  const singular = singularize(model);
  if (schema.complete && !schema.models[upperCaseFirst(singular)]) {
    return Promise.reject(
      `The model '${singular}' doesn't exist in your Midtype project.`
    );
  }
  const mutation = update(singular, variables, schema);
  try {
    const { data } = await client.mutate({
      mutation,
      variables: { id, ...variables }
    });
    return Promise.resolve(data[`update${pascal(singular)}`][singular]);
  } catch (e) {
    return Promise.reject(e);
  }
};
