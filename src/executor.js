// @flow

import axios from 'axios';
import type { AxiosXHRConfig } from 'axios'

import {
  AddCollection,
  DeleteCollection,
  AddColumn,
  DeleteColumn,
  UpdateColumn,
  AddIndex,
  DeleteIndex,
  UpdateIndex,
  AddFunction,
  DeleteFunction,
  UpdateFunction,
  AddTrigger,
  DeleteTrigger,
  UpdateTrigger,
  UpdateCollectionPermissions,
} from './command';

import type {
  Command
} from './command';

const flatten = <A>(arrs: Array<Array<A>>): Array<A> => {
  if (arrs.length === 0) {
    return [];
  }
  return arrs[0].concat(...arrs.slice(1));
};

const execute = (
  commands: Array<Command>,
  parseUrl: string,
  applicationId: string,
  accessKey: string
): void => {
  executeRequests(
    flatten(commands.map(commandToAxiosRequests)),
    parseUrl,
    applicationId,
    accessKey
  );
};

const executeRequests = (
  requests: Array<AxiosXHRConfig<any>>,
  parseUrl: string,
  applicationId: string,
  accessKey: string  
): void => {

  const httpClient = axios.create({
    baseURL: parseUrl,
    headers: {
      ['X-Parse-Application-Id']: applicationId,
      ['X-Parse-Master-Key']: accessKey
    }
  });

  // Execute requests in order
  requests.reduce((previous, current) => (
    previous.then(() => {
      console.log('Executing', JSON.stringify(current));
      httpClient(current);
    })
  ), Promise.resolve());
};

/**
 * Converts the command to one or more axios requests which will fulfill
 * the command.
 */
const commandToAxiosRequests = (command: Command): Array<AxiosXHRConfig<any>> => {
  switch (command.type) {
    case AddCollection.type:
      return [{
        method: 'post',
        url: `/schemas/${command.definition.className}`,
        data: command.definition
      }];
    case DeleteCollection.type:
      return [{
        method: 'delete',
        url: `/schemas/${command.collectionName}`
      }];
    case AddColumn.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {
            [command.name]: command.definition
          },
          indexes: {}
        }
      }];
    case DeleteColumn.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {
            [command.columnName]: { __op: 'Delete' }
          },
          indexes: {}
        }
      }];
    case UpdateColumn.type:
      return [
        {
          method: 'put',
          url: `/schemas/${command.collection}`,
          data: {
            className: command.collection,
            fields: {
              [command.name]: { __op: 'Delete' }
            },
            indexes: {}
          }
        },
        {
          method: 'put',
          url: `/schemas/${command.collection}`,
          data: {
            className: command.collection,
            fields: {
              [command.name]: command.definition
            },
            indexes: {}
          }
        }
      ];
    case AddIndex.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {},
          indexes: {
            [command.name]: command.definition
          }
        }
      }];
    case DeleteIndex.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {},
          indexes: {
            [command.indexName]: { __op: 'Delete' }
          }
        }
      }];
    case UpdateIndex.type: 
      return [
        {
          method: 'put',
          url: `/schemas/${command.collection}`,
          data: {
            className: command.collection,
            fields: {},
            indexes: {
              [command.name]: { __op: 'Delete' }
            }
          }
        },
        {
          method: 'put',
          url: `/schemas/${command.collection}`,
          data: {
            className: command.collection,
            fields: {},
            indexes: {
              [command.name]: command.definition
            }
          }
        }
      ];
    case AddFunction.type:
      return [{
        method: 'post',
        url: `/hooks/functions`,
        data: command.definition
      }];
    case DeleteFunction.type:
      return [{
        method: 'put',
        url: `/hooks/functions/${command.functionName}`,
        data: { __op: 'Delete' }
      }];
    case UpdateFunction.type:
      return [{
        method: 'put',
        url: `/hooks/functions/${command.definition.functionName}`,
        data: { url: command.definition.url }
      }];
    case AddTrigger.type:
      return [{
        method: 'post',
        url: `/hooks/triggers`,
        data: command.definition
      }];
    case DeleteTrigger.type:
      return [{
        method: 'put',
        url: `/hooks/triggers/${command.className}/${command.triggerName}`,
        data: { __op: 'Delete' }
      }];
    case UpdateTrigger.type:
      return [{
        method: 'put',
        url: `/hooks/triggers/${command.definition.className}/${command.definition.triggerName}`,
        data: { url: command.definition.url }
      }];
    case UpdateCollectionPermissions.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          classLevelPermissions: command.definition
        }
      }];
    default:
      return (command: empty); // <- Exhaustiveness check
  }
}

export {
  execute
}
