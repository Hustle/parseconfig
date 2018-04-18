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
  invalidTriggerName,
  invalidTriggerClass,
  invalidPermission,
  invalidFunction,
  duplicateFunction,
} from './validation-error';

const verifySchema = (schema: Schema): Array<ValidationError> => {
  return verifyCollections(schema.collections).concat(
    verifyFunctions(schema.functions),
    verifyTriggers(schema.triggers, schema.collections)
  );
};

// Verify that deleted collections are empty before executing
// Verify that the classes exist for each trigger
const verifyCollections = (collections: Array<CollectionDefinition>): Array<ValidationError> => {
  const errors: Array<ValidationError> = [];
  const names = new Set();
  collections.forEach(coll => {
    errors.push(...verifyCollectionIndexes(coll));
    errors.push(...verifyIndexUniqueness(coll));
    errors.push(...verifyColumnUniqueness(coll));
    errors.push(...verifyPermissions(coll));
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
      // columns added automatically by Parse
      if (['_id', '_updated_at', '_created_at', '_session_token'].includes(indexCol)) {
        return;
      }

      // Properly handle columns that are pointers
      const trueName = indexCol.replace(/^_p_/, '');
      if (!Object.keys(collection.fields).find((columnName) => columnName === trueName)) {
        errors.push(invalidIndex(indexName, indexCol, collection.className));
      }
    });
  });
  return errors;
};

const verifyPermissions = (collection: CollectionDefinition): Array<ValidationError> => {
  const errors = [];
  const names = new Set();
  Object.entries(collection.classLevelPermissions || {}).forEach(([name, perm]) => {
    Object.values(perm).forEach(v => {
      if (v !== true) {
        errors.push(invalidPermission(name, collection.className));
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

const verifyTriggers = (
  triggers: Array<TriggerDefinition>,
  collections: Array<CollectionDefinition>
): Array<ValidationError> => {
  
  const errors: Array<ValidationError> = [];
  const collectionNames = collections.map(c => c.className);
  const names = new Set();
  const key = (trigger) => `${trigger.className}.${trigger.triggerName}`
  triggers.forEach(trigger => {
    errors.push(...verifyTrigger(trigger, collectionNames));
    if (names.has(key(trigger))) {
      errors.push(duplicateTrigger(trigger));
    } else {
      names.add(key(trigger));
    }
  });
  return errors;
};

const verifyTrigger = (
  trigger: TriggerDefinition,
  collections: Array<string>
): Array<ValidationError> => {
  
  const errors = [];
  if (!triggerTypes.includes(trigger.triggerName)) {
    errors.push(invalidTriggerName(trigger));
  }
  if (!collections.includes(trigger.className)) {
    errors.push(invalidTriggerClass(trigger));
  }
  // Should be moved to a deserialization step
  if (!trigger.triggerName || !trigger.className || !trigger.url) {
    errors.push(invalidTrigger(trigger));
  }
  return errors;
};

const verifyFunctions = (functions: Array<FunctionDefinition>): Array<ValidationError> => {
  const errors = [];
  const names = new Set();
  functions.forEach(func => {
    // Should be moved to a deserialization step
    if (!func.functionName || !func.url) {
      errors.push(invalidFunction(func));
    }

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
