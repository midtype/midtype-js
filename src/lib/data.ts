import changeCase from 'change-case';
import pluralize from 'pluralize';
import { gql } from 'apollo-boost';

import { handleHidden } from './hidden';

import { singleton } from '../constants/identifiers';
import { uppercase, accessValue, parsedFieldToQuery } from '../utils/text';
import { parseField } from '../utils/dom';
import logger from '../utils/logger';

const MT_FORM_ID = 'mtMutateId';

const fieldTags = [
  'data-mt-field',
  'data-mt-mutate-field-value',
  'data-mt-mutate-id-value',
  'data-mt-if',
  'data-mt-if-not'
];

const getModelFields = (el: HTMLElement) => {
  let fields: { [key: string]: any } = {};
  const els = el.dataset.mtField
    ? [el]
    : Array.from(
        el.querySelectorAll<HTMLElement>(
          fieldTags.map(tag => `[${tag}]`).join(',')
        )
      );
  els.forEach(field => {
    fieldTags.forEach(tag => {
      const formattedTag = changeCase.camelCase(tag.split('data-')[1]);
      fields = {
        ...fields,
        ...parseField(fields, field.dataset[formattedTag])
      };
    });
  });
  if (fields.id !== null) {
    fields.id = null;
  }
  return fields;
};

export const handleData = () => {
  document.querySelectorAll<HTMLElement>('[data-mt-query]').forEach(model => {
    const name = model.dataset.mtQuery;
    const fields = getModelFields(model);
    let query;
    let variables = {};
    if (name === 'user') {
      query = gql`
        query {
          mUserInSession {
            ${parsedFieldToQuery(fields)}        
          }
        }`;
    } else if (name && model.dataset.mtQueryId) {
      query = gql`
        query Get${uppercase(
          pluralize.singular(changeCase.camel(name))
        )}($id: UUID!) {
          ${pluralize.singular(changeCase.camel(name))}(id: $id) {
            ${parsedFieldToQuery(fields)}        
          }
        }`;
      variables = { id: model.dataset.mtQueryId };
    }
    if (query && name) {
      const key =
        name === 'user'
          ? 'mUserInSession'
          : pluralize.singular(changeCase.camel(name));
      singleton.client
        .query({ query, variables })
        .then(({ data }) => {
          if (data && data[key]) {
            const node = data[key];
            handleHidden(model, node);
            model.style.visibility = 'visible';
            model
              .querySelectorAll<HTMLElement>('[data-mt-field]')
              .forEach(fieldNode => {
                const fieldName = fieldNode.dataset.mtField;
                if (fieldName) {
                  const fieldValue = accessValue(node, fieldName);
                  if (fieldNode.dataset.mtFieldAttribute && fieldValue) {
                    fieldNode.setAttribute(
                      fieldNode.dataset.mtFieldAttribute,
                      fieldValue
                    );
                  } else if (fieldValue) {
                    fieldNode.innerHTML = fieldValue;
                  }
                }
              });
            model
              .querySelectorAll<HTMLInputElement>('[data-mt-mutate-id-value]')
              .forEach(fieldNode => {
                const fieldName = fieldNode.dataset.mtMutateIdValue;
                if (fieldName) {
                  const fieldValue = accessValue(node, fieldName);
                  fieldNode.dataset[MT_FORM_ID] = fieldValue;
                }
              });
          }
        })
        .catch(e => logger.err(e));
    }
  });
  document
    .querySelectorAll<HTMLElement>('[data-mt-query-all]')
    .forEach(root => {
      const name = root.dataset.mtQueryAll;
      const model = root.querySelector<HTMLElement>('*');
      if (name && model) {
        const fields = getModelFields(model);
        const query = gql`
        query Get${uppercase(pluralize(changeCase.camel(name)))} {
          ${pluralize(changeCase.camel(name))} {
            nodes {
              ${parsedFieldToQuery(fields)}
            }
          }
        }`;
        singleton.client
          .query({ query })
          .then(({ data }) => {
            if (data && data[pluralize(changeCase.camel(name))].nodes) {
              const nodes = data[pluralize(changeCase.camel(name))].nodes;
              const newEls: HTMLElement[] = [];
              nodes.forEach((node: any) => {
                const newNode = model.cloneNode(true);
                const newEl = newNode as HTMLElement;
                if (newEl.dataset.mtField) {
                  const fieldName = newEl.dataset.mtField;
                  const fieldValue = newEl.dataset.mtMutateFieldValue;
                  if (fieldName) {
                    const fieldValue = accessValue(node, fieldName);
                    newEl.innerHTML = fieldValue;
                  }
                  if (fieldValue) {
                    const fieldValueValue = accessValue(node, fieldValue);
                    (newEl as HTMLInputElement).value = fieldValueValue;
                  }
                } else {
                  newEl
                    .querySelectorAll<HTMLElement>('[data-mt-field]')
                    .forEach(fieldNode => {
                      const fieldName = fieldNode.dataset.mtField;
                      if (fieldName) {
                        const fieldValue = accessValue(node, fieldName);
                        if (fieldNode.dataset.mtFieldAttribute) {
                          fieldNode.setAttribute(
                            fieldNode.dataset.mtFieldAttribute,
                            fieldValue
                          );
                        } else {
                          fieldNode.innerHTML = fieldValue;
                        }
                      }
                    });
                  newEl
                    .querySelectorAll<HTMLInputElement>('[data-mt-field-value]')
                    .forEach(fieldNode => {
                      const fieldName = fieldNode.dataset.mtField;
                      if (fieldName) {
                        const fieldValue = accessValue(node, fieldName);
                        fieldNode.value = fieldValue;
                      }
                    });
                  newEl
                    .querySelectorAll<HTMLInputElement>(
                      '[data-mt-mutate-id-value]'
                    )
                    .forEach(fieldNode => {
                      const fieldName = fieldNode.dataset.mtMutateIdValue;
                      if (fieldName) {
                        const fieldValue = accessValue(node, fieldName);
                        fieldNode.dataset[MT_FORM_ID] = fieldValue;
                      }
                    });
                }
                newEls.push(newEl);
              });
              root.querySelectorAll('*').forEach(node => node.remove());
              root.append(...newEls);
            }
          })
          .catch(() => null);
      }
    });
};
