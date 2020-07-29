'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DisallowedCommandError = exports.InvalidSchemaError = exports.OutOfSyncError = exports.MissingParameterError = exports.CliError = undefined;

var _validationError = require('./validation-error');

var _command = require('./command');

class CliError extends Error {

  constructor(exitCode, shouldExit, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CliError);
    }

    this.exitCode = exitCode;
    this.shouldExit = shouldExit;
  }
}

class MissingParameterError extends CliError {

  constructor(paramName, flag, envVar, ...params) {
    const msg = `${paramName} must be passed via ${flag} or ${envVar}`;
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingParameterError);
    }

    this.paramName = paramName;
    this.flag = flag;
    this.envVar = envVar;
  }
}

class OutOfSyncError extends CliError {

  constructor(diff, ...params) {
    const prettyDiff = diff.map(command => (0, _command.prettyPrintCommand)(command)).join('\n');
    const msg = `Parse is out of sync with schema. These changes are required:\n${prettyDiff}`;
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OutOfSyncError);
    }
  }
}

class InvalidSchemaError extends CliError {

  constructor(validationErrors, ...params) {
    const msg = validationErrors.map(_validationError.prettyPrintValidationError).join('\n');
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingParameterError);
    }

    this.validationErrors = validationErrors;
  }
}

class DisallowedCommandError extends CliError {

  constructor(command, ...params) {
    const msg = `Schema would cause disallowed command: "${(0, _command.prettyPrintCommand)(command)}"`;
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DisallowedCommandError);
    }

    this.command = command;
  }
}

exports.CliError = CliError;
exports.MissingParameterError = MissingParameterError;
exports.OutOfSyncError = OutOfSyncError;
exports.InvalidSchemaError = InvalidSchemaError;
exports.DisallowedCommandError = DisallowedCommandError;