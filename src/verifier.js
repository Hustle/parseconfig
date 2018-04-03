// @flow

import {
  triggerTypes
} from './schema';

import type {
  Schema,
  CollectionDefinition,
  FunctionDefinition,
  ColumnDefinition,
  IndexDefinition,
  TriggerDefinition,
} from './schema';

import type { ValidationError } from './validation-error';

import {
  duplicateClass,
  invalidIndex,
  duplicateIndex,
  duplicateColumn,
  duplicateTrigger,
  invalidTrigger,
  duplicateFunction,
} from './validation-error';

const verifySchema = (schema: Schema): Array<ValidationError> => {
  return verifyCollections(schema.collections).concat(
    verifyFunctions(schema.functions),
    verifyTriggers(schema.triggers)
  );
};

// verify function, trigger, and collection uniqueness
// Verify that deleted collections are empty before executing
// Verify that the classes exist for each trigger
const verifyCollections = (collections: Array<CollectionDefinition>): Array<ValidationError> => {
  const errors: Array<ValidationError> = [];
  const names = new Set();
  collections.forEach(coll => {
    errors.push(...verifyCollectionIndexes(coll));
    errors.push(...verifyIndexUniqueness(coll));
    errors.push(...verifyColumnUniqueness(coll));
    if (names.has(coll.className)) {
      errors.push(duplicateClass(coll));
    } else {
      names.add(coll.className);
    }
  });
  return errors;
};

const verifyCollectionIndexes = (collection: CollectionDefinition): Array<ValidationError> => {
  const errors = [];
  Object.keys(collection.indexes || {}).forEach((indexName) => {
    const indexDef = (collection.indexes || {})[indexName];
    Object.keys(indexDef).forEach((indexCol) => {
      if (!Object.keys(collection.fields).find((columnName) => columnName === indexCol)) {
        errors.push(invalidIndex(indexName, indexCol));
      }
    });
  });
  return errors;
};

const verifyIndexUniqueness = (collection: CollectionDefinition): Array<ValidationError> => {
  const errors = [];
  const names = new Set();
  Object.keys(collection.indexes || {}).forEach(index => {
    if (names.has(index)) {
      errors.push(duplicateIndex(index, collection.className));
    } else {
      names.add(index);
    }
  });
  return errors;
};

const verifyColumnUniqueness = (collection: CollectionDefinition): Array<ValidationError> => {
  const errors = [];
  const names = new Set();
  Object.keys(collection.fields || {}).forEach(field => {
    if (names.has(field)) {
      errors.push(duplicateColumn(field, collection.className));
    } else {
      names.add(field);
    }
  });
  return errors;
};

const verifyTriggers = (triggers: Array<TriggerDefinition>): Array<ValidationError> => {
  const errors: Array<ValidationError> = [];
  const names = new Set();
  const key = (trigger) => `${trigger.className}.${trigger.triggerName}`
  triggers.forEach(trigger => {
    const nError: ?ValidationError = verifyTrigger(trigger);
    if (nError) {
      errors.push(nError);
    }
    if (names.has(key(trigger))) {
      errors.push(duplicateTrigger(trigger));
    } else {
      names.add(key(trigger));
    }
  });
  return errors;
};

const verifyTrigger = (trigger: TriggerDefinition): ?ValidationError => {
  if (triggerTypes.includes(trigger.triggerName)) {
    return null;
  } else {
    return invalidTrigger(trigger);
  }
};

const verifyFunctions = (functions: Array<FunctionDefinition>): Array<ValidationError> => {
  const errors = [];
  const names = new Set();
  functions.forEach(func => {
    if (names.has(func.functionName)) {
      errors.push(duplicateFunction(func));
    } else {
      names.add(func.functionName);
    }
  });
  return errors;
};

export {
  verifySchema
};
