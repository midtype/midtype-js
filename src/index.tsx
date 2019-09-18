import React from 'react';
import ReactDOM from 'react-dom';
import JSON5 from 'json5';
import md5 from 'md5';
import changeCase from 'change-case';
import { ApolloProvider } from 'react-apollo';

import pluralize from 'pluralize';
import { gql } from 'apollo-boost';

import client from './apollo/client';
import {
  ROOT_ELEMENT_ID,
  singleton,
  STORAGE_CONFIRM_TOKEN
} from './constants/identifiers';
import { getJWT, setJWT } from './utils/jwt';
import { get } from './utils/store';
import { checkQueries } from './utils/queries';
import {
  GET_CURRENT_USER,
  GET_CURRENT_USER_WITH_STRIPE
} from './apollo/queries/currentUser';

import App from './App';

const uppercase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const asyncForEach = async (array: any[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const parseForm = (el: HTMLElement, prefix: string, name?: string) => {
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
            if (singleton.user) {
              fields.push([
                fieldName,
                accessValue({ user: singleton.user }, fieldType || '')
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
              console.warn(`Invalid asset uploaded for field ${fieldName}.`);
            }
            break;
          default:
            fields.push([fieldName, fieldNode.value]);
        }
      }
    });
    if (form) {
      const mutation = el.dataset.mtFormId
        ? gql`
        mutation {
          update${uppercase(
            pluralize.singular(changeCase.camel(form))
          )}(input: { id: "${el.dataset.mtFormId}", patch: { ${fields
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
      singleton.client
        .mutate({
          mutation
        })
        .then(handleData)
        .catch(() => null);
    }
  };
};

const handleForms = async () =>
  document.querySelectorAll<HTMLFormElement>('[data-mt-form]').forEach(el => {
    const run = parseForm(el, 'form');
    const submit = el.querySelector<HTMLElement>('input[type="submit"]');
    if (submit) {
      submit.addEventListener('click', e => {
        run();
        e.preventDefault();
      });
    } else {
      console.warn(
        `${el.dataset.mtForm} form must include <input type="submit"> button.`
      );
    }
  });

const parseSettings = (
  el: HTMLInputElement | HTMLElement
): { [key: string]: any } => {
  let settings = {};
  if (el.dataset.mtSettings) {
    try {
      settings = JSON5.parse(el.dataset.mtSettings);
    } catch {
      console.warn(`Malformed Midtype settings value.`);
    }
  }
  return settings;
};

const register = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );
  const settings = parseSettings(el);
  let { confirmUserUrl, submitUrl } = settings;
  if (!confirmUserUrl) {
    const query = gql`
      {
        setting(key: "confirm_user_urls") {
          key
          value
        }
      }
    `;
    const res = await singleton.client.query({ query });
    if (res.data && res.data.setting && res.data.setting.value.length) {
      confirmUserUrl = res.data.setting.value[0];
    }
  }
  const run = () => {
    if (email) {
      const mutation = gql`
        mutation RegisterUser($email: String!, $url: String!) {
          registerUser(input: { email: $email, url: $url }) {
            success
          }
        }
      `;
      singleton.client
        .mutate({
          mutation,
          variables: { email: email.value, url: confirmUserUrl }
        })
        .then(() => {
          if (submitUrl) {
            window.location.assign(submitUrl);
          }
        })
        .catch(() => null);
    }
  };
  const submit = el.querySelector<HTMLElement>('input[type="submit"]');
  if (submit) {
    submit.addEventListener('click', e => {
      run();
      e.preventDefault();
    });
  } else {
    console.warn(
      'User registration form must include <input type="submit"> button.'
    );
  }
  if (!email) {
    console.warn(
      `User registration forms must include an input for the email field.`
    );
  }
};

const confirmUser = async (el: HTMLElement) => {
  const name = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="name"]'
  );
  const pw = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="password"]'
  );
  const pwConfirm = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="passwordConfirm"]'
  );
  const metadata = el.querySelector<HTMLElement>('[data-mt-action-form-model]');
  const handleMetadata = metadata
    ? parseForm(metadata, 'action-form', metadata.dataset.mtActionFormModel)
    : () => null;
  const run = () => {
    if (!pw) {
      console.warn(`No password input in confirmUser form.`);
      return;
    }
    const match = pwConfirm ? pwConfirm.value === pw.value : true;
    if (match && name) {
      const mutation = gql`
        mutation ConfirmUser(
          $name: String!
          $token: String!
          $password: String!
        ) {
          confirmUser(
            input: { name: $name, token: $token, password: $password }
          ) {
            jwtToken
          }
        }
      `;
      const variables = {
        name: name.value,
        password: md5(pw.value),
        token: get(STORAGE_CONFIRM_TOKEN)
      };
      singleton.client
        .mutate({ mutation, variables })
        .then(res => {
          if (
            res.data &&
            res.data.confirmUser &&
            res.data.confirmUser.jwtToken
          ) {
            setJWT(res.data.confirmUser.jwtToken);
            return getUser();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          handleMetadata();
        })
        .catch(e => console.log(e));
    }
  };
  const submit = el.querySelector<HTMLElement>('input[type="submit"]');
  if (submit) {
    submit.addEventListener('click', e => {
      run();
      e.preventDefault();
    });
  } else {
    console.warn(
      'Confirm user form must include <input type="submit"> button.'
    );
  }
  if (!pw) {
    console.warn(`No password input in confirmUser form.`);
    return;
  }
};

const handleActions = () => {
  document
    .querySelectorAll<HTMLButtonElement>('button[data-mt-action]')
    .forEach(el => {
      switch (el.dataset.mtAction) {
        case 'login':
          el.addEventListener('click', singleton.openLogin);
          break;
        case 'logout':
          el.addEventListener('click', singleton.logout);
          break;
        default:
          console.warn(`Unrecognized Midtype action: ${el.dataset.mtAction}`);
      }
    });
  document.querySelectorAll<HTMLElement>('[data-mt-action]').forEach(el => {});
};

const handleActionForms = () => {
  document
    .querySelectorAll<HTMLFormElement>('form[data-mt-action-form]')
    .forEach(el => {
      switch (el.dataset.mtActionForm) {
        case 'register':
          register(el);
          break;
        case 'confirmUser':
          confirmUser(el);
          break;
        default:
          console.warn(
            `Unrecognized Midtype action form: ${el.dataset.mtAction}`
          );
      }
    });
  document.querySelectorAll<HTMLElement>('[data-mt-action]').forEach(el => {});
};

const handleHidden = () => {
  document.querySelectorAll<HTMLElement>('[data-mt-if-not]').forEach(el => {
    if (el.dataset.mtIfNot) {
      const check = (singleton as any)[el.dataset.mtIfNot] ? true : false;
      if (!check) {
        el.style.visibility = 'visible';
      } else {
        el.style.display = 'none';
      }
    }
  });
  document.querySelectorAll<HTMLElement>('[data-mt-if]').forEach(el => {
    if (el.dataset.mtIf) {
      const check = (singleton as any)[el.dataset.mtIf] ? false : true;
      if (!check) {
        el.style.visibility = 'visible';
      } else {
        el.style.display = 'none';
      }
    }
  });
};

const parseField = (name: string, fields: any) => {
  const split = name.split('.');
  fields[split[0]] =
    split.length > 1 ? parseField(split.slice(1).join('.'), {}) : null;
  return fields;
};

const parsedFieldToQuery = (fields: any) => {
  let q = '';
  Object.keys(fields).forEach(field => {
    q = `${q}${field}${
      fields[field] ? ` {\n${parsedFieldToQuery(fields[field])}}\n` : '\n'
    }`;
  });
  return q;
};

const accessValue = (node: any, val: string): string => {
  const split = val.split('.');
  if (split.length > 1 && node[split[0]]) {
    return accessValue(node[split[0]], split.slice(1).join('.'));
  }
  return node[val];
};

const getModelFields = (el: HTMLElement) => {
  let fields: { [key: string]: any } = {};
  const els = el.dataset.mtField
    ? [el]
    : Array.from(
        el.querySelectorAll<HTMLElement>(
          '[data-mt-field], [data-mt-form-field-value]'
        )
      );
  els.forEach(field => {
    const fieldName = field.dataset.mtField;
    const fieldValue = field.dataset.mtFormFieldValue;
    if (fieldName) {
      fields = { ...fields, ...parseField(fieldName, {}) };
    }
    if (fieldValue) {
      fields = { ...fields, ...parseField(fieldValue, {}) };
    }
  });
  if (fields.id !== null) {
    fields.id = null;
  }
  return fields;
};

const handleData = () => {
  document.querySelectorAll<HTMLElement>('[data-mt-model]').forEach(model => {
    const name = model.dataset.mtModel;
    if (name === 'user') {
      singleton.client
        .query({
          query: singleton.config.stripe
            ? GET_CURRENT_USER_WITH_STRIPE
            : GET_CURRENT_USER
        })
        .then(({ data }) => {
          if (data && data.currentUser) {
            model.style.visibility = 'visible';
            model
              .querySelectorAll<HTMLElement>('[data-mt-field]')
              .forEach(fieldNode => {
                const fieldName = fieldNode.dataset.mtField;
                if (fieldName) {
                  const fieldValue = accessValue(data.currentUser, fieldName);
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
          }
        })
        .catch(() => null);
    } else if (name && model.dataset.mtModelId) {
      const fields = getModelFields(model);
      const query = gql`
        query Get${uppercase(
          pluralize.singular(changeCase.camel(name))
        )}($id: UUID!) {
          ${pluralize.singular(changeCase.camel(name))}(id: $id) {
            ${parsedFieldToQuery(fields)}        
          }
        }`;
      singleton.client
        .query({
          query,
          variables: { id: model.dataset.mtModelId },
          fetchPolicy: 'network-only'
        })
        .then(({ data }) => {
          if (data && data[pluralize.singular(changeCase.camel(name))]) {
            const node = data[pluralize.singular(changeCase.camel(name))];
            model.style.visibility = 'visible';
            model
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
          }
        });
    }
  });
  document.querySelectorAll<HTMLElement>('[data-mt-nodes]').forEach(root => {
    const name = root.dataset.mtNodes;
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
        .query({ query, fetchPolicy: 'network-only' })
        .then(({ data }) => {
          if (data && data[pluralize(changeCase.camel(name))].nodes) {
            const nodes = data[pluralize(changeCase.camel(name))].nodes;
            const newEls: HTMLElement[] = [];
            nodes.forEach((node: any) => {
              const newNode = model.cloneNode(true);
              const newEl = newNode as HTMLElement;
              if (newEl.dataset.mtField) {
                const fieldName = newEl.dataset.mtField;
                const fieldValue = newEl.dataset.mtFormFieldValue;
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

const attachHandlers = () => {
  handleActions();
  handleActionForms();
  if (getJWT()) {
    handleForms();
    handleData();
  }
};

const getUser = () => {
  if (getJWT()) {
    return singleton.client
      .query({
        query: singleton.config.stripe
          ? GET_CURRENT_USER_WITH_STRIPE
          : GET_CURRENT_USER
      })
      .then(({ data }) => {
        singleton.user = data.currentUser;
        handleHidden();
      });
  }
  handleHidden();
  return Promise.resolve();
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
  checkQueries();

  singleton.config = config;

  const root = document.createElement('div');
  root.id = ROOT_ELEMENT_ID;
  document.body.appendChild(root);

  singleton.client = client(config.projectName);

  ReactDOM.render(
    <ApolloProvider client={singleton.client}>
      <App />
    </ApolloProvider>,
    document.getElementById(ROOT_ELEMENT_ID),
    () => {
      getUser();
      attachHandlers();
    }
  );
};
