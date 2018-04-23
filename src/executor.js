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

import type { Logger } from './logger';

const flatten = <A>(arrs: Array<Array<A>>): Array<A> => {
  if (arrs.length === 0) {
    return [];
  }
  return arrs[0].concat(...arrs.slice(1));
};

const omit = <A>(obj: { [string]: A }, omissions: Array<string>): { [string]: A } => {
  const out = {};
  Object.keys(obj).forEach(k => {
    if (!omissions.includes(k)) {
      out[k] = obj[k];
    }
  });
  return out;
};

const autoFields = [
  'objectId',
  'ACL',
  'updatedAt',
  'createdAt',
];

const execute = (
  commands: Array<Command>,
  parseUrl: string,
  applicationId: string,
  accessKey: string,
  logger: Logger,
  verbose: boolean = false
): Promise<*> => {
  return executeRequests(
    flatten(commands.map(commandToAxiosRequests)),
    parseUrl,
    applicationId,
    accessKey,
    logger,
    verbose
  );
};

const executeRequests = (
  requests: Array<AxiosXHRConfig<any>>,
  parseUrl: string,
  applicationId: string,
  accessKey: string,
  logger: Logger,
  verbose: boolean
): Promise<*> => {

  const httpClient = axios.create({
    baseURL: parseUrl,
    headers: {
      ['X-Parse-Application-Id']: applicationId,
      ['X-Parse-Master-Key']: accessKey
    }
  });

  // Execute requests in order
  return requests.reduce((previous, current) => (
    previous.then(() => {
      logger.info('Executing', JSON.stringify(current));
      return httpClient(current);
    })
  ), Promise.resolve()).catch(e => {
    if (verbose) {
      logger.error(e)
    } else {
      logger.error(e.message)
    }
  });
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
        data: {
          className: command.definition.className,
          fields: omit(command.definition.fields, autoFields),
          classLevelPermissions: command.definition.classLevelPermissions,
          indexes: command.definition.indexes
        }
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
          }
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
          }
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
            }
          }
        },
        {
          method: 'put',
          url: `/schemas/${command.collection}`,
          data: {
            className: command.collection,
            fields: {
              [command.name]: command.definition
            }
          }
        }
      ];
    case AddIndex.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
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
