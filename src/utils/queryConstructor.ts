import gql from 'graphql-tag';
import { pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';

import { parsedFieldToQuery } from './text';

const getFields = (fields: string[]) => {
  let map: { [key: string]: any } = {};
  fields.forEach(field => {
    map = {
      ...map,
      ...parseField(map, field)
    };
  });
  if (map.id !== null) {
    map.id = null;
  }
  return map;
};

export const singularize = (name: string) => pluralize.singular(name);

const parseField = (fields: any, name?: string) => {
  if (name) {
    const split = name.split('.');
    fields[split[0]] =
      split.length > 1
        ? parseField(fields[split[0]] || {}, split.slice(1).join('.'))
        : null;
  }
  fields.id = null;
  return fields;
};

export const single = (model: string, fields: string[]) => {
  const map = getFields(fields);
  return gql`
    query Get${pascalCase(model)}($id: UUID!) {
      ${model}(id: $id) {
        ${parsedFieldToQuery(map)}
      }
    }
  `;
};

export const multiple = (model: string, fields: string[]) => {
  const map = getFields(fields);
  return gql`
    query Get${pascalCase(model)} {
      ${model} {
        nodes {
          ${parsedFieldToQuery(map)}
        }
      }
    }
  `;
};

export const create = (model: string, data: any, schema: ISchema) => {
  const upper = pascalCase(model);
  const camel = camelCase(model);
  const nonRefFields = Object.keys(schema.models[upper]).filter(
    field => !schema.models[upper][field].reference
  );
  const inputKey = `Create${pascalCase(model)}Input`;
  if (!schema.inputs[inputKey] || !schema.inputs[inputKey][camel]) {
    throw Error(
      `Input for creating a new record of model '${model}' not found.`
    );
  }
  const input = schema.inputs[inputKey][camel].reference;
  Object.keys(data).forEach(field => {
    if (!input[field]) {
      throw Error(
        `Input field '${field}' not recognized in mutation for creating new record of model '${model}'.`
      );
    }
  });
  return gql`
    mutation Create${pascalCase(model)}(
      ${Object.keys(data)
        .map(field => `$${field}: ${input[field].type}!`)
        .join('\n')}
    ) {
      create${pascalCase(model)}(input: {
        ${model}: {
          ${Object.keys(data)
            .map(field => `${field}: $${field}`)
            .join('\n')}
        }
      }) {
        ${model} {
          ${nonRefFields.join('\n')}
        }
      }
    }
  `;
};

export const update = (model: string, data: any, schema: ISchema) => {
  const upper = pascalCase(model);
  const nonRefFields = Object.keys(schema.models[upper]).filter(
    field => !schema.models[upper][field].reference
  );
  const inputKey = `${pascalCase(model)}Patch`;
  if (!schema.inputs[inputKey]) {
    throw Error(
      `Patch input for updating a record of model '${model}' not found.`
    );
  }
  const input = schema.inputs[inputKey];
  Object.keys(data).forEach(field => {
    if (!input[field]) {
      throw Error(
        `Input field '${field}' not recognized in mutation for updating record of model '${model}'.`
      );
    }
  });
  return gql`
    mutation Update${pascalCase(model)}(
      $id: UUID!,
      ${Object.keys(data)
        .map(field => `$${field}: ${input[field].type}!`)
        .join('\n')}
    ) {
      update${pascalCase(model)}(input: {
        id: $id,
        patch: {
          ${Object.keys(data)
            .map(field => `${field}: $${field}`)
            .join('\n')}
        }
      }) {
        ${model} {
          ${nonRefFields.join('\n')}
        }
      }
    }
  `;
};
