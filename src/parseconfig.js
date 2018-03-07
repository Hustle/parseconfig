// @flow

import url from 'url';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import axios from 'axios';

import type { $AxiosXHR } from 'axios';
import type {
  ParseSchemaResponse,
  Schema,
  CollectionDefinition,
  ColumnDefinition,
  IndexDefinition,
  CollectionPermissions,
  RolePermissions
} from './schema';

import type {
  Command
} from './command';

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

program
  .command('plan <schema> <parseUrl>')
  .description('Generate a gameplan that can be run using the execute command')
  .option('-i', '--application-id <n>', 'Application id of the parse server')
  .option('-k', '--key <n>', 'Parse access key')
  .action((schema, parseUrl, options: { applicationId: ?string, key: ?string }) => {
    
    const applicationId = options.applicationId || process.env.PARSE_APPLICATION_ID;
    const key = options.key || process.env.PARSE_MASTER_KEY;

    if (applicationId === null || applicationId === undefined) {
      throw 'Application id must be passed via -i or PARSE_APPLICATION_ID';
    }
    if (key === null || key === undefined) {
      throw 'Parse Master Key must be passed via -k or PARSE_MASTER_KEY';
    }
    
    plan(schema, parseUrl, applicationId, key).then(results => {
      console.log(JSON.stringify(results));
    });
  })

const plan = (schema: string, parseUrl: string, applicationId: string, key: string) => {
  return axios.get(parseUrl, {
    headers: {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Master-Key': key,
    }
  }).then(handleParseResponse, handleParseError)
    .then((results) => {
    });
};

const handleParseResponse = (response: $AxiosXHR<ParseSchemaResponse>) => {
  if (response.data.error) {
    return Promise.reject(response.data.error);
  }
  return response;
};

const handleParseError = (response) => {
  let result = response.data.error;
  if (result.error) {
    result = result.error;
  }
  return Promise.reject(result);
};

// verify function, trigger, and collection uniqueness
// verify that trigger types are valid

// Verify that all of the indices only reference columns which exist.
const verifyIndexes = (collection: CollectionDefinition) => {
  Object.keys(collection.indexes).forEach((indexName) => {
    const indexDef = collection.indexes[indexName];
    Object.keys(indexDef).forEach((indexCol) => {
      if (!Object.keys(collection.fields).includes((columnName) => columnName === indexCol)) {
        throw `Invalid index: $indexDef includes non-existant column "$indexCol"`;
      }
    });
  });
};

/*
program
  .command('dump <type>')
  .description('Dump configuration info')
  .action((type) => {
    validateType(type);
    fetchFromParseP(type).then((configs) => {
      console.log(
        JSON.stringify(_.sortBy(configs.map(c => c.dump()), sortKeys(type)), null, 4)
      );
    }).catch(e => fail(e));
  }).on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ parseconfig dump functions');
    console.log('    $ parseconfig dump triggers');
    console.log('    $ parseconfig dump schemas');
    console.log();
  });


program
  .command('load <type> <file>')
  .description('Load the config info into the default parse instance.')
  .option('-f, --force', 'Replace an existing configuration even if defined')
  .option('--iknowwhatiamdoing', 'Must be set to modify production')
  .action((type, file, options) => {
    prodCheck(options);
    validateType(type);
    const configs = fetchFromConfig(type, file);

    Promise.all(configs.map((c) => {
      let p;
      if (options.force) {
        p = c.existsP().then((exists) => {
          if (exists) {
            return c.updateP();
          }
          return c.loadP();
        });
      } else {
        p = c.loadP();
      }

      return p.then((def) => {
        if (def) {
          const newState = def.url || `${def.className} loaded`;
          console.log(`${initConfig.parseEnv.green}:${c.getName().blue}: ${newState}`);
        }
      }).catch((e) => {
        if (e.toString().includes('Class') && e.toString().includes('does not exist')) {
          return c.loadP();
        }
        console.error(`ERROR:${initConfig.parseEnv.red}:${c.getName().blue}: ${JSON.stringify(e)}`);
      });
    }));
  }).on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('   $ parseconfig load functions config/functions.json');
    console.log('   $ parseconfig load triggers config/triggers.json');
    console.log('   $ parseconfig load schemas config/schemas.json');
    console.log();
  });

program
  .command('delete <type> [file]')
  .option('-a, --all', 'Delete all configurations')
  .option('--iknowwhatiamdoing', 'Must be set to modify production')
  .description('Delete configurations from the server.')
  .action((type, file, options) => {
    prodCheck(options);
    validateType(type);
    if (file && options.all || !file && !options.all) {
      fail('must specify either --all or <file> but not both');
    }
    let configsP;
    if (options.all) {
      configsP = fetchFromParseP(type);
    } else {
      configsP = Promise.resolve(fetchFromConfig(type, file));
    }

    configsP.then((configs) => {
      return configs.reduce((p, c) => {
        return p.then(() => c.deleteP()).then(
          () => console.log(`${initConfig.parseEnv.green}:${c.getName().blue}: deleted`),
          e => console.error(`ERROR:${initConfig.parseEnv.red}:${c.getName().blue}: ${e}`)
        );
      }, Promise.resolve());
    });
  }).on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('   $ parseconfig delete functions scripts/functions.json');
    console.log('   $ parseconfig delete triggers scripts/triggers.json');
    console.log();
  });

program
  .command('reset <type> <file>')
  .option('--iknowwhatiamdoing')
  .description('Reset the configuration of the server to match the file.')
  .action((type, file, options) => {
    prodCheck(options);
    validateType(type);
    const iknowwhatiamdoing = options.iknowwhatiamdoing
      ? '--iknowwhatiamdoing'
      : '';
    if (exec(`./parseconfig.js delete ${iknowwhatiamdoing} --all ${type}`)) {
      fail(`failed attempting to delete ${type}`);
    }

    if (exec(`./parseconfig.js load ${iknowwhatiamdoing} ${type} ${path.resolve(process.cwd(), file)}`)) {
      fail(`failed attempting to load ${type}`);
    }
  }).on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('   $ parseconfig reset functions scripts/functions.json');
    console.log('   $ parseconfig reset triggers scripts/triggers.json');
    console.log();
  });

program
  .command('diff <type> [file]')
  .description('Show what diff if file was forcefully loaded into the server.')
  .action((type, file) => {
    validateType(type);
    fetchFromParseP(type).then((parseConfigs) => {
      let fileConfigs = fetchFromConfig(type, file);
      fileConfigs = _.sortBy(fileConfigs.map(c => c.getDefinition()), sortKeys(type));
      parseConfigs = _.sortBy(parseConfigs.map(c => c.getDefinition()), sortKeys(type));
      diff.diffJson(parseConfigs, fileConfigs).forEach((part) => {
        let color = 'grey';
        color = part.added ? 'green' : color;
        color = part.removed ? 'red' : color;
        process.stdout.write(part.value[color]);
      });
    }).catch(e => fail(e));
  }).on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ parseconfig diff functions');
    console.log('    $ parseconfig diff triggers scripts/triggers.json');
    console.log('    $ parseconfig diff schemas ');
    console.log();
  });

class Configuration {
  constructor(def) {
    if (!this.validate(def)) {
      const className = this.constructor.name;
      throw new Error(`invalid ${className} definition ${JSON.stringify(def)}`);
    }
    this.def = def;
  }

  static fromConfig(config) {
    return new this(config);
  }

  static fetchAllP() {
    return fetchAllP(`${this.baseURL()}`).then((configs) => {
      return Promise.resolve(configs.map(t => new this(_.omit(t, 'objectId'))));
    });
  }

  static baseURL() {
    throw new Error('Subclasses of Configuration should override static baseURL');
  }

  validate() {
    throw new Error('Subclasses of Configuration should override validate');
  }

  getLoadURL() {
    return this.constructor.baseURL();
  }

  getUpdateURL() {
    return `${this.constructor.baseURL()}/${this.getName()}`;
  }

  getDeleteURL() {
    return `${this.constructor.baseURL()}/${this.getName()}`;
  }

  getDefinition() {
    return this.def;
  }

  existsP() {
    return fetchP(this.getUpdateURL()).then((x) => {
      return Promise.resolve(!!x);
    }, (error) => {
      // does not exist in parse, so we return false as to load it
      if (error.toString().includes('does not exist')) {
        return Promise.resolve(false);
      }
      return Promise.reject(error);
    });
  }

  deleteP() {
    return deleteP(this.getDeleteURL());
  }
}

class Schema extends Configuration {
  static baseURL() {
    return `${PARSE_SERVER_URL}/schemas`;
  }

  validate(def) {
    const attributeNames = ['className', 'fields', 'classLevelPermissions'];
    return _.every(attributeNames, name => _.has(def, name));
  }

  dump() {
    const sortedFieldNames = Object.keys(this.def.fields).sort();
    const fields = _.reduce(sortedFieldNames, (fields, field) => {
      fields[field] = this.def.fields[field];
      return fields;
    }, {});

    // Try to produce output in this order (even though it's not guaranteed to print this way)
    return Object.assign({
      className: this.def.className,
      fields,
      classLevelPermissions: this.def.classLevelPermissions,
    });
  }

  loadP() {
    return loadWithChangeP(this.getLoadURL(), _.omit(this.def, [
      'fields.objectId',
      'fields.ACL',
      'fields.createdAt',
      'fields.updatedAt',
    ]));
  }

  updateField(current) {
    const change = {
      className: this.def.className,
      fields: current,
    };
    return updateWithChangeP(this.getUpdateURL(), change).catch((error) => {
      if (error.toString().includes('exists, cannot update')) return;
      return Promise.reject(error);
    });
  }

  updateP() {
    return Promise.all(Object.keys(this.def).map((prop) => {
      if (!(this.def[prop] instanceof Object)) return false;
      if (prop === 'fields') {
        // go through each field and send them individually
        // Why? Parse adds the fields only if none of them exist; otherwise, error
        const fields = _.map(this.def.fields, (v, k) => {
          return { [k]: v };
        });
        return Promise.all(fields.map(this.updateField, this));
      }

      // send all other properties (currently just classLevelPermissions) at once
      // Why? If a classLevelPermission is updated individually, all the others become {}
      const change = {
        className: this.def.className,
        [prop]: this.def[prop],
      };
      return updateWithChangeP(this.getUpdateURL(), change);
    })).then(() => this.def);
  }

  getName() {
    return this.def.className;
  }
}

class Hook extends Configuration {
  static fromConfig(configDef) {
    // We could technically use the https://*.ngrok.io subdomain but
    // it's faster to make the local connection to the API on port 5100
    const subd = subdomain();
    const isLocal = subd.match('ngrok.io');
    const host = isLocal ? 'localhost:5100' : subd;
    const protocol = isLocal ? 'http' : 'https';

    const pathname = configDef.path;
    const targetUrl = url.format({ protocol, host, pathname });
    const def = _.merge(_.omit(configDef, ['path']), { url: targetUrl });
    return new this(def);
  }

  dump() {
    const path = url.parse(this.def.url).pathname;
    return _.merge(_.omit(this.def, ['url']), { path });
  }

  loadP() {
    return loadWithChangeP(this.getLoadURL(), this.def);
  }

  updateP() {
    return updateWithChangeP(this.getUpdateURL(), { url: this.def.url });
  }

  replaceP() {
    return this.deleteP().then(() => {
      return this.loadP();
    });
  }
}

class Func extends Hook {
  static baseURL() {
    return `${PARSE_SERVER_URL}/hooks/functions`;
  }

  validate(def) {
    return _.has(def, 'functionName') && _.has(def, 'url');
  }

  getName() {
    return this.def.functionName;
  }
}

class Trigger extends Hook {
  static baseURL() {
    return `${PARSE_SERVER_URL}/hooks/triggers`;
  }

  validate(def) {
    return _.has(def, 'className') && _.has(def, 'triggerName') && _.has(def, 'url');
  }

  getName() {
    return `${this.def.className}/${this.def.triggerName}`;
  }
}

function handleParseResponse(response) {
  if (response.error) return Promise.reject(response.error);
  return response;
}

function handleParseError(response) {
  let result = response.error;
  if (result.error) {
    result = result.error;
  }
  return Promise.reject(result);
}

function fail(error) {
  console.error(error);
  process.exit(1);
}

function makeHeaders() {
  return {
    'X-Parse-Application-Id': initConfig.parseAppId,
    'X-Parse-Master-Key': initConfig.parseMasterKey,
  };
}

function deleteP(url) {
  return rp.put({
    url,
    headers: makeHeaders(),
    json: { __op: 'Delete' },
  }).then(handleParseResponse, handleParseError);
}

function updateWithChangeP(url, change) {
  return rp.put({
    url,
    headers: makeHeaders(),
    json: change,
  }).then(handleParseResponse, handleParseError);
}

function loadWithChangeP(url, change) {
  return rp.post({
    url,
    headers: makeHeaders(),
    json: change,
  }).then(handleParseResponse, handleParseError)
    .then(() => {
      if (change instanceof Schema) {
        console.log(`Class added: ${change.className}`);
      }
    });
}

function fetchAllP(url) {
  console.log(`Fetching all @ ${url}`);
  return rp.get({
    url,
    headers: makeHeaders(),
    json: true,
  }).then(handleParseResponse, handleParseError)
    .then((results) => {
      if (results instanceof Array) { // handle parse server output
        return Promise.resolve(results);
      } else if (Object.keys(results).length) {
        return Promise.resolve(results.results);
      }
    });
}

function fetchP(url) {
  return rp.get({
    url,
    headers: makeHeaders(),
    json: true,
  }).then(handleParseResponse, handleParseError);
}

function fetchFromConfig(type, file) {
  return readConfig(file).map((e) => {
    switch (type) {
      case 'triggers': return Trigger.fromConfig(e);
      case 'functions': return Func.fromConfig(e);
      case 'schemas': return Schema.fromConfig(e);
    }
    throw new Error(`unexpected type: ${type}`);
  });
}

function fetchFromParseP(type) {
  switch (type) {
    case 'triggers': return Trigger.fetchAllP();
    case 'functions': return Func.fetchAllP();
    case 'schemas': return Schema.fetchAllP();
  }
}

function sortKeys(type) {
  switch (type) {
    case 'triggers': return ['className', 'triggerName'];
    case 'functions': return ['functionName'];
    case 'schemas': return ['className'];
  }
}

function readConfig(filename) {
  const file = path.resolve(process.cwd(), filename);
  fs.exists(file, (ok) => {
    if (!ok) {
      fail(`load file does not exist ${file}`);
    }
  });
  const config = fs.readFileSync(file, 'utf8');
  return JSON.parse(config);
}

function validateType(type) {
  if (type !== 'functions' && type !== 'schemas' && type !== 'triggers') {
    program.outputHelp();
    fail(`unknown type ${type}`);
  }
}

function prodCheck(options) {
  if (initConfig.parseAppId === '3R6dD56v1iXsBQlhge1Bjf8RI7j3NEqOIy9HAAiU' && !options.iknowwhatiamdoing) {
    fail('to modify production you must pass in the --iknowwhatiamdoing flag');
  }
}

function exec(cmd) {
  console.log(`EXECUTING ${cmd}`);
  const ret = shelljs.exec(cmd, { cwd: __dirname, env: process.env });
  return ret.code;
}

function subdomain() {
  return appConfig.currentConfig().subdomain;
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
const initConfig = require('./script_init');

program.parse(process.argv);
*/
