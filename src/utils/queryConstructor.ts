import { gql } from 'apollo-boost';
import pluralize from 'pluralize';
import changeCase from 'change-case';

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
  const singular = pluralize.singular(model);
  const map = getFields(fields);
  const query = gql`
    query Get${changeCase.pascalCase(singular)}($id: UUID!) {
      ${singular}(id: $id) {
        ${parsedFieldToQuery(map)}
      }
    }
  `;
  return { query, singular };
};

export const multiple = (model: string, fields: string[]) => {
  const plural = pluralize(model);
  const map = getFields(fields);
  const query = gql`
    query Get${changeCase.pascalCase(plural)} {
      ${plural} {
        nodes {
          ${parsedFieldToQuery(map)}
        }
      }
    }
  `;
  return { query, plural };
};
