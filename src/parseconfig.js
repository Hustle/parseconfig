// @flow

import url from 'url';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import program from 'commander';
import axios from 'axios';

import type { $AxiosXHR } from 'axios';
import type {
  ParseSchemaResponse,
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

const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;

// TODO: consolidate printing of status into a function
// TODO: support indexes
export type CliOptions = {
  applicationId: ?string,
  key: ?string,
  hookUrl: ?string,
  ignoreIndexes: boolean
}

program.usage('parseconfig [commands]');

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
  .action(async (parseUrl, schema, cliOptions: CliOptions) => {
    try {
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gameplan = await getPlan(newSchema, parseUrl, options);
      console.log(JSON.stringify(gameplan));
    } catch (e) {
      if (e instanceof CliError) {
        console.error(e.message);
        if (e.shouldExit) {
          process.exit(e.exitCode);
        }
      }
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
      await check(newSchema, parseUrl, options);
      console.error('Parse is up-to-date');
    } catch (e) {
      if (e instanceof CliError) {
        console.error(e.message);
        if (e.shouldExit) {
          process.exit(e.exitCode);
        }
      }
    }
  });

program
  .command('apply <parseUrl> <schema>')
  .description('Apply the given schema to Parse')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (parseUrl, schema, cliOptions: CliOptions) => {
    try {

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const options = validateOptions(cliOptions);
      const newSchema = getNewSchema(schema);
      const gamePlan = await getPlan(newSchema, parseUrl, options);
      
      gamePlan.forEach((command) => console.log(prettyPrintCommand(command)));
      
      rl.question('Do you want to execute these commands? [y/N]', (answer) => {
        if (answer.toLowerCase() !== 'y') {
          console.error('Exiting without making changes');
          process.exit();
        }
     
        execute(
          gamePlan,
          parseUrl,
          options.applicationId,
          options.key
        );
        rl.close()
      })
    } catch (e) {
      if (e instanceof CliError) {
        console.error(e.message);
        if (e.shouldExit) {
          process.exit(e.exitCode);
        }
      }
    };
  });

program
  .command('execute <parseUrl> <commands>')
  .description('Execute the given gameplan against Parse')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (parseUrl, commands, cliOptions: CliOptions) => {
    try {

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const options = validateOptions(cliOptions);
      const gamePlan = JSON.parse(commands);
      
      gamePlan.forEach((command) => console.log(prettyPrintCommand(command)));
      
      rl.question('Do you want to execute these commands? [y/N]', (answer) => {
        if (answer.toLowerCase() !== 'y') {
          console.error('Exiting without making changes');
          process.exit();
        }
     
        execute(
          gamePlan,
          parseUrl,
          options.applicationId,
          options.key
        );
        rl.close()
      })
    } catch (e) {
      if (e instanceof CliError) {
        console.error(e.message);
        if (e.shouldExit) {
          process.exit(e.exitCode);
        }
      }
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

const validateOptions = (options: CliOptions): Options => {
  const applicationId: ?string = options.applicationId || process.env.PARSE_APPLICATION_ID;
  const key: ?string = options.key || process.env.PARSE_MASTER_KEY;
  const hookUrl: ?string = options.hookUrl || process.env.PARSE_HOOK_URL || null;
  const ignoreIndexes = options.ignoreIndexes;

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
    ignoreIndexes
  };
};

program.parse(process.argv);
