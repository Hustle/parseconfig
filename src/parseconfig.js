// @flow

import url from 'url';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import program from 'commander';
import axios from 'axios';

import type { $AxiosXHR } from 'axios';
import type {
  Schema,
  CollectionDefinition,
  FunctionDefinition,
  TriggerDefinition
} from './schema';

import {
  AddIndex,
  UpdateIndex,
  DeleteIndex,
  prettyPrintCommand,
} from './command';

import type {
  Command
} from './command';

import type { Options } from './actions';

import { plan } from './planner';
import { execute } from './executor';
import { getPlan, check } from './actions';
import { CliError, MissingParameterError } from './errors';
import { consoleLogger } from './logger';

const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;

// TODO: consolidate printing of status into a function
// TODO: support indexes
export type CliOptions = {
  applicationId: ?string,
  key: ?string,
  hookUrl: ?string,
  ignoreIndexes: boolean,
  disallowColumnRedefine: boolean,
  disallowIndexRedefine: boolean,
  verbose: boolean
}

program.usage('parseconfig [commands]');

function handleError(e) {
  if (e instanceof CliError) {
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

program
  .command('plan <parseUrl> <schema>')
  .description('Generate a gameplan that can be run using the execute command')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .option('--disallow-column-redefine', 'Prevents columns from being updated or deleted')
  .option('--disallow-index-redefine', 'Prevents indices from being updated or deleted')
  .action(async (parseUrl, schema, cliOptions: CliOptions) => {
    try {
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gamePlan = await getPlan(newSchema, parseUrl, options, consoleLogger);
      console.log(JSON.stringify(gamePlan));
    } catch (e) {
      handleError(e);
    }
  });

program
  .command('check <parseUrl> <schema>')
  .description('Return an error if Parse is out of sync with the given schema')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (parseUrl, schema, cliOptions: CliOptions) => {
    try {
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      await check(newSchema, parseUrl, options, consoleLogger);
      console.error('Parse is up-to-date');
    } catch (e) {
      handleError(e);
    }
  });

program
  .command('apply <parseUrl> <schema>')
  .description('Apply the given schema to Parse')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--non-interactive', 'Do not ask for confirmation before applying changes')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .option('--disallow-column-redefine', 'Prevents columns from being updated or deleted')
  .option('--disallow-index-redefine', 'Prevents indices from being updated or deleted')
  .option('--verbose', 'Output extra logging')
  .action(async (parseUrl, schema, cliOptions: CliOptions) => {
    try {

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gamePlan = await getPlan(newSchema, parseUrl, options, consoleLogger);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }
      
      gamePlan.forEach((command) => console.error(prettyPrintCommand(command)));

      if (cliOptions.nonInteractive) {
        execute(
          gamePlan,
          parseUrl,
          options.applicationId,
          options.key,
          consoleLogger,
          !!cliOptions.verbose
        );
        rl.close()
      } else {
        rl.question('Do you want to execute these commands? [y/N] ', (answer) => {
          if (answer.toLowerCase() !== 'y') {
            console.error('Exiting without making changes');
            process.exit();
          }
          
          execute(
            gamePlan,
            parseUrl,
            options.applicationId,
            options.key,
            consoleLogger,
            !!cliOptions.verbose
          );
          rl.close()
        });
      }
    } catch (e) {
      handleError(e);
    };
  });

program
  .command('execute <parseUrl> <commands>')
  .description('Execute the given gameplan against Parse')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--non-interactive', 'Do not ask for confirmation before applying changes')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .option('--verbose', 'Output extra logging')
  .action(async (parseUrl, commandsFile, cliOptions: CliOptions) => {
    try {

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const options = validateOptions(cliOptions);
      const gamePlan = getCommands(commandsFile);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }
      
      gamePlan.forEach((command) => console.error(prettyPrintCommand(command)));
      
      if (cliOptions.nonInteractive) {
        execute(
          gamePlan,
          parseUrl,
          options.applicationId,
          options.key,
          consoleLogger,
          !!cliOptions.verbose
        );
        rl.close()
      } else {
        rl.question('Do you want to execute these commands? [y/N] ', (answer) => {
          if (answer.toLowerCase() !== 'y') {
            console.error('Exiting without making changes');
            process.exit();
          }
          
          execute(
            gamePlan,
            parseUrl,
            options.applicationId,
            options.key,
            consoleLogger,
            !!cliOptions.verbose
          );
          rl.close()
        });
      }
    } catch (e) {
      handleError(e);
    };
  });


program
  .command('display <commands>')
  .description('Display the given gameplan')
  .option('--verbose', 'Output extra logging')
  .action(async (commandsFile, cliOptions: CliOptions) => {
    try {
      const gamePlan = getCommands(commandsFile);

      if (gamePlan.length === 0) {
        console.error('No changes to make');
        process.exit();
      }

      gamePlan.forEach((command) => console.error(prettyPrintCommand(command)));
    } catch (e) {
      handleError(e);
    };
  });

const getNewSchema = (schemaFile: string): Schema => {
  try {
    const fileContents = fs.readFileSync(schemaFile, {encoding: 'UTF-8'});
    return JSON.parse(fileContents);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    throw err; // Satisfy flow
  }
};

const getCommands = (commandFile: string): Array<Command> => {
  try {
    const fileContents = fs.readFileSync(commandFile, {encoding: 'UTF-8'});
    console.log(fileContents)
    return JSON.parse(fileContents);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    throw err; // Satisfy flow
  }
};

const validateOptions = (options: CliOptions): Options => {
  const applicationId: ?string = options.applicationId || process.env.PARSE_APPLICATION_ID;
  const key: ?string = options.key || process.env.PARSE_MASTER_KEY;
  const hookUrl: ?string = options.hookUrl || process.env.PARSE_HOOK_URL || null;
  const ignoreIndexes = options.ignoreIndexes;
  const disallowColumnRedefine = options.disallowColumnRedefine;
  const disallowIndexRedefine = options.disallowIndexRedefine;

  if (applicationId === null || applicationId === undefined) {
    throw new MissingParameterError('Application id', '-i', 'PARSE_APPLICATION_ID');
  }
  if (key === null || key === undefined) {
    throw new MissingParameterError('Parse Master Key', '-k', 'PARSE_MASTER_KEY');
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

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help()
}
