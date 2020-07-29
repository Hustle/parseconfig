'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLiveSchema = exports.execute = exports.check = exports.getPlan = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _command = require('./command');

var _planner = require('./planner');

var _executor = require('./executor');

var _verifier = require('./verifier');

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const getPlan = (() => {
  var _ref = _asyncToGenerator(function* (newSchema, parseUrl, options, logger) {
    const applicationId = options.applicationId;
    const key = options.key;
    const hookUrl = options.hookUrl;

    const validationErrors = (0, _verifier.verifySchema)(newSchema);
    if (validationErrors.length > 0) {
      throw new _errors.InvalidSchemaError(validationErrors);
    }
    const oldSchema = yield getLiveSchema(parseUrl, applicationId, key, logger);
    let commands = (0, _planner.plan)(newSchema, oldSchema, hookUrl);
    if (options.ignoreIndexes) {
      commands = commands.filter(function (c) {
        return c.type !== _command.AddIndex.type && c.type !== _command.UpdateIndex.type && c.type !== _command.DeleteIndex.type;
      });
      commands.forEach(function (c) {
        if (c.type === _command.AddCollection.type) {
          c.definition.indexes = {};
        }
      });
    }
    if (options.disallowColumnRedefine) {
      commands.forEach(function (c) {
        if (c.type !== _command.UpdateColumn.type || c.type !== _command.DeleteColumn.type) {
          throw new _errors.DisallowedCommandError(c);
        }
      });
    }
    if (options.disallowIndexRedefine) {
      commands.forEach(function (c) {
        if (c.type !== _command.UpdateIndex.type || c.type !== _command.DeleteIndex.type) {
          throw new _errors.DisallowedCommandError(c);
        }
      });
    }
    return commands;
  });

  return function getPlan(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

const check = (() => {
  var _ref2 = _asyncToGenerator(function* (newSchema, parseUrl, options, logger) {
    const commands = yield getPlan(newSchema, parseUrl, options, logger);

    if (commands.length === 0) {
      return;
    }
    throw new _errors.OutOfSyncError(commands);
  });

  return function check(_x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
})();

const getLiveSchema = (() => {
  var _ref3 = _asyncToGenerator(function* (parseUrl, applicationId, key, logger) {

    const httpClient = _axios2.default.create({
      baseURL: parseUrl,
      headers: {
        ['X-Parse-Application-Id']: applicationId,
        ['X-Parse-Master-Key']: key
      }
    });

    const collections = yield httpClient({
      method: 'get',
      url: '/schemas'
    }).then(function (response) {
      return response.data.results;
    }).catch(function (e) {
      logger.error('Unable to retrieve collections from Parse.');
      return Promise.reject(e);
    });

    const functions = yield httpClient({
      method: 'get',
      url: '/hooks/functions'
    }).then(function (response) {
      return response.data;
    }).catch(function (e) {
      logger.error('Unable to retrieve functions from Parse.');
      return Promise.reject(e);
    });

    const triggers = yield httpClient({
      method: 'get',
      url: '/hooks/triggers'
    }).then(function (response) {
      return response.data;
    }).catch(function (e) {
      logger.error('Unable to retrieve triggers from Parse.');
      return Promise.reject(e);
    });

    return {
      collections,
      functions,
      triggers
    };
  });

  return function getLiveSchema(_x9, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
})();

exports.getPlan = getPlan;
exports.check = check;
exports.execute = _executor.execute;
exports.getLiveSchema = getLiveSchema;