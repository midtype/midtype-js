import { ApolloClient, gql } from 'apollo-boost';
import { plural } from 'pluralize';
import { pascal, camel } from 'change-case';

import { initClient } from '../apollo/client';
import { initActions } from './operations/actions';
import { initQuery, initQueryAll } from './operations/queries';
import { initUpdate, initCreate } from './operations/mutations';
import { midtypeModels } from '../constants';

export class Midtype {
  public config: IMidtypeConfig;
  public actions: IActions;
  public client: ApolloClient<any>;
  public utils = { gql };

  public create: { [key: string]: IMidtypeCreate } = {};
  public update: { [key: string]: IMidtypeUpdate } = {};
  public query: { [key: string]: IMidtypeQuery | IMidtypeQueryAll } = {};

  public user?: IUser;

  private schema: ISchema = {
    complete: false,
    inputs: {},
    models: {}
  };

  constructor(config: IMidtypeConfig) {
    this.config = config;
    this.client = initClient(config.endpoint);
    this.actions = initActions(config, this.client);
  }

  init = async () => {
    this.schema = await this.actions.introspect();
    this.user = await this.actions.getUser();
    this.initOperations();
  };

  initOperations = () => {
    const { schema, client } = this;
    Object.keys(schema.models).forEach(model => {
      const camelCase = camel(model);
      const pascalCase = pascal(model);
      this.query[camelCase] = initQuery(camelCase, schema, client);
      this.query[plural(camelCase)] = initQueryAll(camelCase, schema, client);
      if (!midtypeModels.includes(pascalCase)) {
        this.create[camelCase] = initCreate(camelCase, schema, client);
        this.update[camelCase] = initUpdate(camelCase, schema, client);
      }
    });
  };
}
