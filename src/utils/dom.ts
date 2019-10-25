import JSON5 from 'json5';
import changeCase from 'change-case';
import pluralize from 'pluralize';
import gql from 'graphql-tag';

import logger from './logger';
import handleError from './error';
import { getJWT } from './jwt';
import { uppercase, accessValue } from './text';
import { handleData } from '../lib/data';
import { singleton } from '../constants/identifiers';

export const parseSettings = (
  el: HTMLInputElement | HTMLElement
): { [key: string]: any } => {
  let settings = {};
  if (el.dataset.mtSettings) {
    try {
      settings = JSON5.parse(el.dataset.mtSettings);
    } catch {
      logger.err(`Malformed Midtype settings value.`);
    }
  }
  return settings;
};

export const postSubmitAction = (el: HTMLElement) => {
  if (el.dataset.redirect) {
    window.location.assign(el.dataset.redirect);
  } else {
    const settings = parseSettings(el);
    if (settings.submitUrl) {
      window.location.assign(settings.submitUrl);
    }
  }
};

const asyncForEach = async (array: any[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const parseFormId = (el: HTMLElement) => {
  return el.dataset.mtMutateId;
};

export const parseForm = (el: HTMLElement, prefix: string, name?: string) => {
  const form = name || el.dataset[changeCase.camel(`mt-${prefix}`)];
  el.querySelectorAll<HTMLElement>(`[data-mt-${prefix}-field-type]`).forEach(
    fieldNode => {
      const type =
        fieldNode.dataset[changeCase.camel(`mt-${prefix}-field-type`)];
      if (type && type.startsWith('user.')) {
        fieldNode.style.display = 'none';
      }
    }
  );
  return async () => {
    const fields: Array<[string, string | boolean | number]> = [];
    const nodes = Array.from(
      el.querySelectorAll<HTMLInputElement>(`[data-mt-${prefix}-field]`)
    );
    await asyncForEach(nodes, async (fieldNode: HTMLInputElement) => {
      const fieldName =
        fieldNode.dataset[changeCase.camel(`mt-${prefix}-field`)];
      const fieldType =
        fieldNode.dataset[changeCase.camel(`mt-${prefix}-field-type`)];
      if (fieldName) {
        const type = fieldType ? fieldType.split('.')[0] : null;
        switch (type) {
          case 'user': {
            if (singleton.data.user) {
              fields.push([
                fieldName,
                accessValue({ user: singleton.data.user }, fieldType || '')
              ]);
            }
            break;
          }
          case 'boolean':
            fields.push([fieldName, fieldNode.checked ? true : false]);
            break;
          case 'number':
            fields.push([fieldName, parseFloat(fieldNode.value) || 0]);
            break;
          case 'asset':
            const file = (fieldNode as any).files[0];
            const body = new FormData();
            body.append('asset', file);
            const asset = await fetch('https://api.midtype.com/upload', {
              method: 'POST',
              body,
              headers: { Authorization: `Bearer ${getJWT()}` }
            }).then(res => res.json());
            if (asset) {
              fields.push([fieldName, asset.asset_id]);
            } else {
              logger.err(`Invalid asset uploaded for field ${fieldName}.`);
            }
            break;
          default:
            fields.push([fieldName, fieldNode.value]);
        }
      }
    });
    if (form) {
      const id = parseFormId(el);
      const mutation = id
        ? gql`
        mutation {
          update${uppercase(
            pluralize.singular(changeCase.camel(form))
          )}(input: { id: "${id}", patch: { ${fields
            .map(
              field =>
                `${field[0]}: ${
                  typeof field[1] === 'string' ? `"${field[1]}"` : field[1]
                }`
            )
            .join(', ')} } }) {
            clientMutationId
          }
        }`
        : gql`
        mutation {
          create${uppercase(
            pluralize.singular(changeCase.camel(form))
          )}(input: { ${form}: { ${fields
            .map(
              field =>
                `${field[0]}: ${
                  typeof field[1] === 'string' ? `"${field[1]}"` : field[1]
                }`
            )
            .join(', ')} } }) {
            clientMutationId
          }
        }
      `;
      return singleton.client
        .mutate({
          mutation
        })
        .then(() => handleData())
        .then(() => postSubmitAction(el));
    }
  };
};

export const parseField = (fields: any, name?: string) => {
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

export const submitForm = (
  el: HTMLElement,
  run: () => Promise<any>,
  action: IMidtypeActionMetadata
) => {
  const submit = el.querySelector<HTMLInputElement>('input[type="submit"]');
  if (!submit) {
    logger.err(
      `${action.id || 'Form'} must include <input type="submit"> button.`
    );
    return;
  }
  submit.addEventListener('click', e => {
    e.preventDefault();
    const originalValue = submit.value;
    if (submit.dataset.wait) {
      submit.value = submit.dataset.wait;
    }
    run()
      .catch(e => {
        handleError({ id: action.id, el }, e);
      })
      .finally(() => {
        submit.value = originalValue;
      });
  });
};
