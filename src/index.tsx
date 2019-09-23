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

const MT_FORM_ID = 'mtFormId';

const uppercase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const asyncForEach = async (array: any[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const parseFormId = (el: HTMLElement) => {
  return el.dataset.mtFormId;
};

const postSubmitAction = (el: HTMLElement) => {
  if (el.dataset.redirect) {
    window.location.assign(el.dataset.redirect);
  } else {
    const settings = parseSettings(el);
    if (settings.submitUrl) {
      window.location.assign(settings.submitUrl);
    }
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
      singleton.client
        .mutate({
          mutation
        })
        .then(handleData)
        .then(() => postSubmitAction(el))
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

const verifyEmail = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );
  let { confirmUserUrl } = parseSettings(el);
  if (!confirmUserUrl) {
    const query = gql`
      {
        mSetting(key: "confirm_user_urls") {
          key
          value
        }
      }
    `;
    const res = await singleton.client.query({ query });
    if (res.data && res.data.mSetting && res.data.mSetting.value.length) {
      confirmUserUrl = res.data.mSetting.value[0];
    }
  }
  const run = () => {
    if (email) {
      const mutation = gql`
        mutation VerifyEmail($email: String!, $url: String!) {
          mCheckEmail(input: { email: $email, url: $url }) {
            success
          }
        }
      `;
      singleton.client
        .mutate({
          mutation,
          variables: { email: email.value, url: confirmUserUrl }
        })
        .then(() => postSubmitAction(el))
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
      'User email verification form must include <input type="submit"> button.'
    );
  }
  if (!email) {
    console.warn(
      `User email verification forms must include an input for the email field.`
    );
  }
};

const createUser = async (el: HTMLElement) => {
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
      console.warn(`No password input in create user form.`);
      return;
    }
    const match = pwConfirm ? pwConfirm.value === pw.value : true;
    if (match && name) {
      const mutation = gql`
        mutation CreateUser(
          $name: String!
          $token: String!
          $password: String!
        ) {
          createMUser(
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
            res.data.createMUser &&
            res.data.createMUser.jwtToken
          ) {
            setJWT(res.data.createMUser.jwtToken);
            return getUser();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          handleMetadata();
        })
        .then(() => postSubmitAction(el))
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
    console.warn('Create user form must include <input type="submit"> button.');
  }
  if (!pw) {
    console.warn(`No password input in create user form.`);
    return;
  }
};

const authenticate = async (el: HTMLElement) => {
  const email = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="email"]'
  );
  const pw = el.querySelector<HTMLInputElement>(
    'input[data-mt-action-form-field="password"]'
  );
  const run = () => {
    if (!pw || !email) {
      return;
    }
    const mutation = gql`
      mutation Authenticate($email: String!, $password: String!) {
        mAuthenticate(input: { email: $email, password: $password }) {
          jwtToken
        }
      }
    `;
    const variables = {
      email: email.value,
      password: md5(pw.value)
    };
    singleton.client
      .mutate({ mutation, variables })
      .then(res => {
        if (
          res.data &&
          res.data.mAuthenticate &&
          res.data.mAuthenticate.jwtToken
        ) {
          setJWT(res.data.mAuthenticate.jwtToken);
          return getUser();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => postSubmitAction(el))
      .catch(e => console.log(e));
  };
  const submit = el.querySelector<HTMLElement>('input[type="submit"]');
  if (submit) {
    submit.addEventListener('click', e => {
      run();
      e.preventDefault();
    });
  } else {
    console.warn('Create user form must include <input type="submit"> button.');
  }
  if (!pw || !email) {
    console.warn(`No password input in sign in form.`);
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
};

const handleActionForms = () => {
  document
    .querySelectorAll<HTMLFormElement>('form[data-mt-action-form]')
    .forEach(el => {
      switch (el.dataset.mtActionForm) {
        case 'signup':
          verifyEmail(el);
          break;
        case 'createUser':
          createUser(el);
          break;
        case 'login':
          authenticate(el);
          break;
        default:
          console.warn(
            `Unrecognized Midtype action form: ${el.dataset.mtAction}`
          );
      }
    });
};

const checkIfExists = (key: string) =>
  (singleton as any)[key] || (singleton as any).data[key] || get(key)
    ? true
    : false;

const handleHidden = () => {
  document
    .querySelectorAll<HTMLElement>('[data-mt-if-not], [data-mt-if]')
    .forEach(el => {
      let visible = false;
      if (el.dataset.mtIfNot && el.dataset.mtIf) {
        const idsIf = el.dataset.mtIf.split(',').map(id => id.trim());
        const idsIfNot = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible =
          idsIf.every(id => checkIfExists(id)) &&
          idsIfNot.every(id => checkIfExists(id) === false);
      } else if (el.dataset.mtIfNot) {
        const ids = el.dataset.mtIfNot.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id) === false);
      } else if (el.dataset.mtIf) {
        const ids = el.dataset.mtIf.split(',').map(id => id.trim());
        visible = ids.every(id => checkIfExists(id));
      }
      if (visible) {
        el.style.visibility = 'visible';
      } else {
        el.style.display = 'none';
      }
    });
};

const parseField = (name: string, fields: any) => {
  const split = name.split('.');
  fields[split[0]] =
    split.length > 1
      ? parseField(split.slice(1).join('.'), fields[split[0]] || {})
      : null;
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
          '[data-mt-field], [data-mt-form-field-value], [data-mt-form-id-value]'
        )
      );
  els.forEach(field => {
    if (field.dataset.mtField) {
      fields = { ...fields, ...parseField(field.dataset.mtField, fields) };
    }
    if (field.dataset.mtFormFieldValue) {
      fields = {
        ...fields,
        ...parseField(field.dataset.mtFormFieldValue, fields)
      };
    }
    if (field.dataset.mtFormIdValue) {
      fields = {
        ...fields,
        ...parseField(field.dataset.mtFormIdValue, fields)
      };
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
    } else if (name && model.dataset.mtModelId) {
      query = gql`
        query Get${uppercase(
          pluralize.singular(changeCase.camel(name))
        )}($id: UUID!) {
          ${pluralize.singular(changeCase.camel(name))}(id: $id) {
            ${parsedFieldToQuery(fields)}        
          }
        }`;
      variables = { id: model.dataset.mtModelId };
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
            model
              .querySelectorAll<HTMLInputElement>('[data-mt-form-id-value]')
              .forEach(fieldNode => {
                const fieldName = fieldNode.dataset.mtFormIdValue;
                if (fieldName) {
                  const fieldValue = accessValue(node, fieldName);
                  fieldNode.dataset[MT_FORM_ID] = fieldValue;
                }
              });
          }
        })
        .catch(() => null);
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
                newEl
                  .querySelectorAll<HTMLInputElement>('[data-mt-form-id-value]')
                  .forEach(fieldNode => {
                    const fieldName = fieldNode.dataset.mtFormIdValue;
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

const attachHandlers = () => {
  handleActions();
  handleActionForms();
  if (getJWT()) {
    handleData();
    handleForms();
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
        singleton.user = data.mUserInSession;
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
