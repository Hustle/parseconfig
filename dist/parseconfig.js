#!/usr/bin/env node
'use strict';

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _command = require('./command');

var _planner = require('./planner');

var _executor = require('./executor');

var _actions = require('./actions');

var _errors = require('./errors');

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;

// TODO: consolidate printing of status into a function
// TODO: support indexes


_commander2.default.usage('parseconfig [commands]');

function handleError(e) {
  if (e instanceof _errors.CliError) {
    console.error(e.message);
    if (e.shouldExit) {
      process.exit(e.exitCode);
    }
  } else {
    console.error('Unexpected error:', e);
    process.exit(2);
  }
}

// commands:
// plan: outputs a gameplan in JSON format that can be executed
// --disallow-column-redefine: returns an error if the definition of a column changes
// --disallow-index-redefine: returns an error if the definition of an index changes
// execute: takes a gameplan in JSON and executes it.
// apply: Converts a schema into a gameplan then executes it, asks for confirmation first.
// --dry-run: prints commands instead of executing them.
// --non-interactive: doesn't ask for confirmation before applying gameplan
// --disallow-column-redefine: returns an error if the definition of a column changes
// --disallow-index-redefine: returns an error if the definition of an index changes

_commander2.default.command('plan <parseUrl> <schema>').description('Generate a gameplan that can be run using the execute command').option('-i, --application-id <s>', 'Application id of the parse server').option('-k, --key <s>', 'Parse access key').option('-u, --hook-url <s>', 'Base url for functions and triggers').option('--ignore-indexes', 'Skips verification and updating of indices').option('--disallow-column-redefine', 'Prevents columns from being updated or deleted').option('--disallow-index-redefine', 'Prevents indices from being updated or deleted').action((() => {
  var _ref = _asyncToGenerator(function* (parseUrl, schema, cliOptions) {
    try {
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gamePlan = yield (0, _actions.getPlan)(newSchema, parseUrl, options, _logger.consoleLogger);
      console.log(JSON.stringify(gamePlan));
    } catch (e) {
      handleError(e);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})());

_commander2.default.command('check <parseUrl> <schema>').description('Return an error if Parse is out of sync with the given schema').option('-i, --application-id <s>', 'Application id of the parse server').option('-k, --key <s>', 'Parse access key').option('-u, --hook-url <s>', 'Base url for functions and triggers').option('--ignore-indexes', 'Skips verification and updating of indices').action((() => {
  var _ref2 = _asyncToGenerator(function* (parseUrl, schema, cliOptions) {
    try {
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      yield (0, _actions.check)(newSchema, parseUrl, options, _logger.consoleLogger);
      console.error('Parse is up-to-date');
    } catch (e) {
      handleError(e);
    }
  });

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})());

_commander2.default.command('apply <parseUrl> <schema>').description('Apply the given schema to Parse').option('-i, --application-id <s>', 'Application id of the parse server').option('-k, --key <s>', 'Parse access key').option('-u, --hook-url <s>', 'Base url for functions and triggers').option('--non-interactive', 'Do not ask for confirmation before applying changes').option('--ignore-indexes', 'Skips verification and updating of indices').option('--disallow-column-redefine', 'Prevents columns from being updated or deleted').option('--disallow-index-redefine', 'Prevents indices from being updated or deleted').option('--verbose', 'Output extra logging').action((() => {
  var _ref3 = _asyncToGenerator(function* (parseUrl, schema, cliOptions) {
    try {

      const rl = _readline2.default.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gamePlan = yield (0, _actions.getPlan)(newSchema, parseUrl, options, _logger.consoleLogger);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }

      gamePlan.forEach(function (command) {
        return console.error((0, _command.prettyPrintCommand)(command));
      });

      if (cliOptions.nonInteractive) {
        (0, _executor.execute)(gamePlan, parseUrl, options.applicationId, options.key, _logger.consoleLogger, !!cliOptions.verbose).then(function () {
          return rl.close();
        }, handleError);
      } else {
        rl.question('Do you want to execute these commands? [y/N] ', function (answer) {
          if (answer.toLowerCase() !== 'y') {
            console.error('Exiting without making changes');
            process.exit();
          }

          (0, _executor.execute)(gamePlan, parseUrl, options.applicationId, options.key, _logger.consoleLogger, !!cliOptions.verbose).then(function () {
            return rl.close();
          }, handleError);
        });
      }
    } catch (e) {
      handleError(e);
    };
  });

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
})());

_commander2.default.command('execute <parseUrl> <commands>').description('Execute the given gameplan against Parse').option('-i, --application-id <s>', 'Application id of the parse server').option('-k, --key <s>', 'Parse access key').option('-u, --hook-url <s>', 'Base url for functions and triggers').option('--non-interactive', 'Do not ask for confirmation before applying changes').option('--ignore-indexes', 'Skips verification and updating of indices').option('--verbose', 'Output extra logging').action((() => {
  var _ref4 = _asyncToGenerator(function* (parseUrl, commandsFile, cliOptions) {
    try {

      const rl = _readline2.default.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const options = validateOptions(cliOptions);
      const gamePlan = getCommands(commandsFile);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }

      gamePlan.forEach(function (command) {
        return console.error((0, _command.prettyPrintCommand)(command));
      });

      if (cliOptions.nonInteractive) {
        (0, _executor.execute)(gamePlan, parseUrl, options.applicationId, options.key, _logger.consoleLogger, !!cliOptions.verbose).then(function () {
          return rl.close();
        }, handleError);
      } else {
        rl.question('Do you want to execute these commands? [y/N] ', function (answer) {
          if (answer.toLowerCase() !== 'y') {
            console.error('Exiting without making changes');
            process.exit();
          }

          (0, _executor.execute)(gamePlan, parseUrl, options.applicationId, options.key, _logger.consoleLogger, !!cliOptions.verbose).then(function () {
            return rl.close();
          }, handleError);
        });
      }
    } catch (e) {
      handleError(e);
    };
  });

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
})());

_commander2.default.command('display <commands>').description('Display the given gameplan').option('--verbose', 'Output extra logging').action((() => {
  var _ref5 = _asyncToGenerator(function* (commandsFile, cliOptions) {
    try {
      const gamePlan = getCommands(commandsFile);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }

      gamePlan.forEach(function (command) {
        return console.error((0, _command.prettyPrintCommand)(command));
      });
    } catch (e) {
      handleError(e);
    };
  });

  return function (_x13, _x14) {
    return _ref5.apply(this, arguments);
  };
})());

const parseSchemaJSON = jsonSchema => {
  const schema = JSON.parse(jsonSchema);
  const newSchema = schema;
  for (let i = 0; i < schema.collections.length; i++) {
    // NOTE: parse-server stores indices in _SCHEMA in a naive way
    // (name => key), we store indices with their options for
    // posterity. Since we don't use parse-server to apply these
    // indices, munge the shape to what we expect
    const simpleIndices = {};
    const indices = schema.collections[i].indexes;
    // $FlowFixMe
    const indexEntries = Object.entries(indices);
    for (const [key, value] of indexEntries) {
      simpleIndices[key] = value.key;
    }
    newSchema.collections[i].indexes = simpleIndices;
  }
  return newSchema;
};

const getNewSchema = schemaFile => {
  try {
    const fileContents = _fs2.default.readFileSync(schemaFile, { encoding: 'UTF-8' });
    return parseSchemaJSON(fileContents);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    throw err; // Satisfy flow
  }
};

const getCommands = commandFile => {
  try {
    const fileContents = _fs2.default.readFileSync(commandFile, { encoding: 'UTF-8' });
    console.log(fileContents);
    return JSON.parse(fileContents);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    throw err; // Satisfy flow
  }
};

const validateOptions = options => {
  const applicationId = options.applicationId || process.env.PARSE_APPLICATION_ID;
  const key = options.key || process.env.PARSE_MASTER_KEY;
  const hookUrl = options.hookUrl || process.env.PARSE_HOOK_URL || null;
  const ignoreIndexes = options.ignoreIndexes;
  const disallowColumnRedefine = options.disallowColumnRedefine;
  const disallowIndexRedefine = options.disallowIndexRedefine;

  if (applicationId === null || applicationId === undefined) {
    throw new _errors.MissingParameterError('Application id', '-i', 'PARSE_APPLICATION_ID');
  }
  if (key === null || key === undefined) {
    throw new _errors.MissingParameterError('Parse Master Key', '-k', 'PARSE_MASTER_KEY');
  }
  return {
    applicationId,
    key,
    hookUrl,
    ignoreIndexes,
    disallowColumnRedefine,
    disallowIndexRedefine
  };
};

_commander2.default.parse(process.argv);

if (process.argv.length < 3) {
  _commander2.default.help();
}