'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _command = require('./command');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flatten = arrs => {
  if (arrs.length === 0) {
    return [];
  }
  return arrs[0].concat(...arrs.slice(1));
};

const omit = (obj, omissions) => {
  const out = {};
  Object.keys(obj).forEach(k => {
    if (!omissions.includes(k)) {
      out[k] = obj[k];
    }
  });
  return out;
};

const autoFields = ['objectId', 'ACL', 'updatedAt', 'createdAt'];

const execute = (commands, parseUrl, applicationId, accessKey, logger, verbose = false) => {
  return executeRequests(flatten(commands.map(commandToAxiosRequests)), parseUrl, applicationId, accessKey, logger, verbose);
};

const executeRequests = (requests, parseUrl, applicationId, accessKey, logger, verbose) => {

  const httpClient = _axios2.default.create({
    baseURL: parseUrl,
    headers: {
      ['X-Parse-Application-Id']: applicationId,
      ['X-Parse-Master-Key']: accessKey
    }
  });

  // Execute requests in order
  return requests.reduce((previous, current) => previous.then(() => {
    logger.info('Executing', JSON.stringify(current));
    return httpClient(current);
  }), Promise.resolve()).catch(e => {
    if (verbose) {
      logger.error(e);
    } else {
      logger.error(e.message);
    }
    throw e;
  });
};

/**
 * Converts the command to one or more axios requests which will fulfill
 * the command.
 */
const commandToAxiosRequests = command => {
  switch (command.type) {
    case _command.AddCollection.type:
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
    case _command.DeleteCollection.type:
      return [{
        method: 'delete',
        url: `/schemas/${command.collectionName}`
      }];
    case _command.AddColumn.type:
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
    case _command.DeleteColumn.type:
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
    case _command.UpdateColumn.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {
            [command.name]: { __op: 'Delete' }
          }
        }
      }, {
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          fields: {
            [command.name]: command.definition
          }
        }
      }];
    case _command.AddIndex.type:
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
    case _command.DeleteIndex.type:
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
    case _command.UpdateIndex.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          indexes: {
            [command.name]: { __op: 'Delete' }
          }
        }
      }, {
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          indexes: {
            [command.name]: command.definition
          }
        }
      }];
    case _command.AddFunction.type:
      return [{
        method: 'post',
        url: `/hooks/functions`,
        data: command.definition
      }];
    case _command.DeleteFunction.type:
      return [{
        method: 'put',
        url: `/hooks/functions/${command.functionName}`,
        data: { __op: 'Delete' }
      }];
    case _command.UpdateFunction.type:
      return [{
        method: 'put',
        url: `/hooks/functions/${command.definition.functionName}`,
        data: { url: command.definition.url }
      }];
    case _command.AddTrigger.type:
      return [{
        method: 'post',
        url: `/hooks/triggers`,
        data: command.definition
      }];
    case _command.DeleteTrigger.type:
      return [{
        method: 'put',
        url: `/hooks/triggers/${command.className}/${command.triggerName}`,
        data: { __op: 'Delete' }
      }];
    case _command.UpdateTrigger.type:
      return [{
        method: 'put',
        url: `/hooks/triggers/${command.definition.className}/${command.definition.triggerName}`,
        data: { url: command.definition.url }
      }];
    case _command.UpdateCollectionPermissions.type:
      return [{
        method: 'put',
        url: `/schemas/${command.collection}`,
        data: {
          className: command.collection,
          classLevelPermissions: command.definition
        }
      }];
    default:
      return command; // <- Exhaustiveness check
  }
};

exports.execute = execute;