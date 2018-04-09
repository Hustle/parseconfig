// @flow

import type { ValidationError } from './validation-error';
import { prettyPrintValidationError } from './validation-error';
import type { Command } from './command';
import { prettyPrintCommand } from './command';

class CliError extends Error {
  
  exitCode: number
  shouldExit: boolean
  
  constructor(exitCode: number, shouldExit: boolean, ...params: any) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CliError);
    }

    this.exitCode = exitCode;
    this.shouldExit = shouldExit;
  }
}

class MissingParameterError extends CliError {
  
  paramName: string
  flag: string
  envVar: string
  
  constructor(paramName: string, flag: string, envVar: string, ...params: any) {
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
  
  constructor(...params: any) {
    const msg = 'Parse is out of sync with schema, Run plan to see differences';
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OutOfSyncError);
    }
  }
}

class InvalidSchemaError extends CliError {
  
  validationErrors: Array<ValidationError>
  
  constructor(validationErrors: Array<ValidationError>, ...params: any) {
    const msg = validationErrors.map(prettyPrintValidationError).join('\n');
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingParameterError);
    }

    this.validationErrors = validationErrors;
  }
}

class DisallowedCommandError extends CliError {
  
  command: Command
  
  constructor(command: Command, ...params: any) {
    const msg = `Schema would cause disallowed command: "${prettyPrintCommand(command)}"`;
    super(1, true, msg, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DisallowedCommandError);
    }

    this.command = command;
  }
}

export {
  CliError,
  MissingParameterError,
  OutOfSyncError,
  InvalidSchemaError,
  DisallowedCommandError,
}
