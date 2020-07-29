'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifySchema = undefined;

var _schema = require('./schema');

var _validationError = require('./validation-error');

const verifySchema = schema => {
  return verifyCollections(schema.collections).concat(verifyFunctions(schema.functions), verifyTriggers(schema.triggers, schema.collections));
};

// Verify that deleted collections are empty before executing
// Verify that the classes exist for each trigger
const verifyCollections = collections => {
  const errors = [];
  const names = new Set();
  collections.forEach(coll => {
    errors.push(...verifyCollectionIndexes(coll));
    errors.push(...verifyIndexUniqueness(coll));
    errors.push(...verifyColumnUniqueness(coll));
    errors.push(...verifyPermissions(coll));
    if (names.has(coll.className)) {
      errors.push((0, _validationError.duplicateClass)(coll));
    } else {
      names.add(coll.className);
    }
  });
  return errors;
};

const verifyCollectionIndexes = collection => {
  const errors = [];
  Object.keys(collection.indexes || {}).forEach(indexName => {
    const indexDef = (collection.indexes || {})[indexName];
    Object.keys(indexDef).forEach(indexCol => {
      // columns added automatically by Parse
      if (['_id', '_updated_at', '_created_at', '_session_token'].includes(indexCol)) {
        return;
      }

      // Properly handle columns that are pointers
      const trueName = indexCol.replace(/^_p_/, '');
      if (!Object.keys(collection.fields).find(columnName => columnName === trueName)) {
        errors.push((0, _validationError.invalidIndex)(indexName, indexCol, collection.className));
      }
    });
  });
  return errors;
};

const verifyPermissions = collection => {
  const errors = [];
  const names = new Set();
  Object.entries(collection.classLevelPermissions || {}).forEach(([name, perm]) => {
    Object.values(perm).forEach(v => {
      if (v !== true) {
        errors.push((0, _validationError.invalidPermission)(name, collection.className));
      }
    });
  });
  return errors;
};

const verifyIndexUniqueness = collection => {
  const errors = [];
  const names = new Set();
  Object.keys(collection.indexes || {}).forEach(index => {
    if (names.has(index)) {
      errors.push((0, _validationError.duplicateIndex)(index, collection.className));
    } else {
      names.add(index);
    }
  });
  return errors;
};

const verifyColumnUniqueness = collection => {
  const errors = [];
  const names = new Set();
  Object.keys(collection.fields || {}).forEach(field => {
    if (names.has(field)) {
      errors.push((0, _validationError.duplicateColumn)(field, collection.className));
    } else {
      names.add(field);
    }
  });
  return errors;
};

const verifyTriggers = (triggers, collections) => {

  const errors = [];
  const collectionNames = collections.map(c => c.className);
  const names = new Set();
  const key = trigger => `${trigger.className}.${trigger.triggerName}`;
  triggers.forEach(trigger => {
    errors.push(...verifyTrigger(trigger, collectionNames));
    if (names.has(key(trigger))) {
      errors.push((0, _validationError.duplicateTrigger)(trigger));
    } else {
      names.add(key(trigger));
    }
  });
  return errors;
};

const verifyTrigger = (trigger, collections) => {

  const errors = [];
  if (!_schema.triggerTypes.includes(trigger.triggerName)) {
    errors.push((0, _validationError.invalidTriggerName)(trigger));
  }
  if (!collections.includes(trigger.className)) {
    errors.push((0, _validationError.invalidTriggerClass)(trigger));
  }
  // Should be moved to a deserialization step
  if (!trigger.triggerName || !trigger.className || !trigger.url) {
    errors.push((0, _validationError.invalidTrigger)(trigger));
  }
  return errors;
};

const verifyFunctions = functions => {
  const errors = [];
  const names = new Set();
  functions.forEach(func => {
    // Should be moved to a deserialization step
    if (!func.functionName || !func.url) {
      errors.push((0, _validationError.invalidFunction)(func));
    }

    if (names.has(func.functionName)) {
      errors.push((0, _validationError.duplicateFunction)(func));
    } else {
      names.add(func.functionName);
    }
  });
  return errors;
};

exports.verifySchema = verifySchema;