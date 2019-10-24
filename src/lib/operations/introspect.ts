import { ApolloClient } from 'apollo-boost';

import logger from '../../utils/logger';
import INTROSPECT from '../../apollo/queries/introspection';
import { isGraphObject } from '../../utils/text';

export const initIntrospect = (client: ApolloClient<any>) => async () => {
  const schema: ISchema = {
    complete: false,
    inputs: {},
    models: {}
  };
  try {
    const { data } = await client.query({
      query: INTROSPECT
    });
    const types = data.__schema.types;
    types.forEach((type: any) => {
      switch (type.kind) {
        case 'OBJECT':
          if (!isGraphObject(type.name)) {
            schema.models[type.name] = {};
            const model = schema.models[type.name];
            type.fields.forEach((field: any) => {
              const type = field.type.name || field.type.ofType.name;
              if (field.type.kind === 'NON_NULL') {
                model[field.name] = { type, required: true };
              } else if (type) {
                model[field.name] = { type, required: false };
              }
            });
          }
          break;
        case 'INPUT_OBJECT':
          if (!type.name.endsWith('Filter')) {
            schema.inputs[type.name] = {};
            const input = schema.inputs[type.name];
            type.inputFields.forEach((field: any) => {
              const type = field.type.name || field.type.ofType.name;
              if (field.type.kind === 'NON_NULL') {
                input[field.name] = { type, required: true };
              } else if (type) {
                input[field.name] = { type, required: false };
              }
            });
          }
          break;
        default:
          break;
      }
    });
    Object.keys(schema.models).forEach(modelKey => {
      const model = schema.models[modelKey];
      Object.keys(model).forEach(fieldKey => {
        const field = model[fieldKey];
        if (schema.models[field.type]) {
          field.reference = schema.models[field.type];
        }
      });
    });
    Object.keys(schema.inputs).forEach(inputKey => {
      const input = schema.inputs[inputKey];
      Object.keys(input).forEach(fieldKey => {
        const field = input[fieldKey];
        if (schema.inputs[field.type]) {
          field.reference = schema.inputs[field.type];
        }
      });
    });
  } catch (e) {
    logger.err('Introspection on this Midtype project failed.');
  }
  schema.complete = true;
  return schema;
};
