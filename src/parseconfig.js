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

import { plan } from './planner';
import { execute } from './executor';

const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;

// TODO: consolidate printing of status into a function
// TODO: support indexes

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
type Options = {
  applicationId: ?string,
  key: ?string,
  hookUrl: ?string,
  ignoreIndexes: boolean
}

program
  .command('plan <schema> <parseUrl>')
  .description('Generate a gameplan that can be run using the execute command')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (schema, parseUrl, options: Options) => {
    const applicationId: ?string = options.applicationId || process.env.PARSE_APPLICATION_ID;
    const key: ?string = options.key || process.env.PARSE_MASTER_KEY;
    const hookUrl: ?string = options.hookUrl || process.env.PARSE_HOOK_URL || null;

    if (applicationId === null || applicationId === undefined) {
      console.error('Application id must be passed via -i or PARSE_APPLICATION_ID');
      process.exit(1);
      throw 'error'; // to make flow happy
    }
    if (key === null || key === undefined) {
      console.error('Parse Master Key must be passed via -k or PARSE_MASTER_KEY');
      process.exit(1);
      throw 'error'; // to make flow happy
    }

    const newSchema = getNewSchema(schema);
    const oldSchema = await getLiveSchema(parseUrl, applicationId, key);
    let commands = plan(newSchema, oldSchema, hookUrl);
    if (options.ignoreIndexes) {
      commands = commands.filter(c => (
        c.type !== AddIndex.type
        && c.type !== UpdateIndex.type
        && c.type !== DeleteIndex.type
      ));
    }
    console.log(JSON.stringify(commands));
  });

program
  .command('apply <schema> <parseUrl>')
  .description('Apply the given schema to Parse')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (schema, parseUrl, options: Options) => {
    const applicationId: ?string = options.applicationId || process.env.PARSE_APPLICATION_ID;
    const key: ?string = options.key || process.env.PARSE_MASTER_KEY;
    const hookUrl: ?string = options.hookUrl || process.env.PARSE_HOOK_URL || null;

    if (applicationId === null || applicationId === undefined) {
      console.error('Application id must be passed via -i or PARSE_APPLICATION_ID');
      process.exit(1);
      throw 'error'; // to make flow happy
    }
    if (key === null || key === undefined) {
      console.error('Parse Master Key must be passed via -k or PARSE_MASTER_KEY');
      process.exit(1);
      throw 'error'; // to make flow happy
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const newSchema = getNewSchema(schema);
    const oldSchema = await getLiveSchema(parseUrl, applicationId, key);
    let commands = plan(newSchema, oldSchema, hookUrl);
    if (options.ignoreIndexes) {
      commands = commands.filter(c => (
        c.type !== AddIndex.type
        && c.type !== UpdateIndex.type
        && c.type !== DeleteIndex.type
      ));
    }
    commands.forEach((command) => console.log(prettyPrintCommand(command)));
    rl.question('Do you want to execute these commands? [y/N]', (answer) => {
      if (answer.toLowerCase() !== 'y') {
        console.log('Exiting without making changes');
        process.exit();
      }
      
      execute(
        commands,
        parseUrl,
        applicationId,
        key
      );
      rl.close()
    });
  });

program
  .command('check <schema> <parseUrl>')
  .description('Return an error if Parse is out of sync with the given schema')
  .option('-i, --application-id <s>', 'Application id of the parse server')
  .option('-k, --key <s>', 'Parse access key')
  .option('-u, --hook-url <s>', 'Base url for functions and triggers')
  .option('--ignore-indexes', 'Skips verification and updating of indices')
  .action(async (schema, parseUrl, options: Options) => {
    const applicationId: ?string = options.applicationId || process.env.PARSE_APPLICATION_ID;
    const key: ?string = options.key || process.env.PARSE_MASTER_KEY;
    const hookUrl: ?string = options.hookUrl || process.env.PARSE_HOOK_URL || null;

    if (applicationId === null || applicationId === undefined) {
      console.error('Application id must be passed via -i or PARSE_APPLICATION_ID');
      process.exit(1);
      throw 'error'; // to make flow happy
    }
    if (key === null || key === undefined) {
      console.error('Parse Master Key must be passed via -k or PARSE_MASTER_KEY');
      process.exit(1);
      throw 'error'; // to make flow happy
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const newSchema = getNewSchema(schema);
    const oldSchema = await getLiveSchema(parseUrl, applicationId, key);
    let commands = plan(newSchema, oldSchema, hookUrl);
    if (options.ignoreIndexes) {
      commands = commands.filter(c => (
        c.type !== AddIndex.type
        && c.type !== UpdateIndex.type
        && c.type !== DeleteIndex.type
      ));
    }
    if (commands.length === 0) {
      console.error('Parse is up-to-date');
      process.exit();
    }
    console.error('Parse is out of sync with schema, Run plan to see differences');
    process.exit(1);
  })

const getNewSchema = (schemaFile: string): Schema => {
  const fileContents = fs.readFileSync(schemaFile, {encoding: 'UTF-8'});
  return JSON.parse(fileContents);
};

const getLiveSchema = async (
  parseUrl: string,
  applicationId: string,
  key: string
): Promise<Schema> => {

  const httpClient = axios.create({
    baseURL: parseUrl,
    headers: {
      ['X-Parse-Application-Id']: applicationId,
      ['X-Parse-Master-Key']: key
    }
  });
  
  const collections = await httpClient({
    method: 'get',
    url: '/schemas'
  }).then(response => response.data.results)
    .catch((e) => {
      console.log('Unable to retrieve collections from Parse.', e);
      process.exit();
      return Promise.reject(); // satisfy flow
    });
  
  const functions = await httpClient({
    method: 'get',
    url: '/hooks/functions'
  }).then(response => response.data)
    .catch(() => {
      console.log('Unable to retrieve functions from Parse.');
      process.exit();
      return Promise.reject(); // satisfy flow
    });
  
  const triggers = await httpClient({
    method: 'get',
    url: '/hooks/triggers'
  }).then(response => response.data)
    .catch(() => {
      console.log('Unable to retrieve triggers from Parse.');
      process.exit();
      return Promise.reject(); // satisfy flow
    });

  return {
    collections,
    functions,
    triggers,
  };
};
program.parse(process.argv);
