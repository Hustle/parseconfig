'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const duplicateClass = collection => `Duplicate definitions for class ${collection.className}`;

// ValidationErrors are strings at runtime


const invalidIndex = (indexName, fieldName, collectionName) => `Invalid index: ${indexName} on collection ${collectionName} includes non-existent column "${fieldName}"`;

const duplicateIndex = (index, className) => `Duplicate definitions for index ${index} on ${className}`;

const duplicateColumn = (field, className) => `Duplicate definitions for field ${field} on ${className}`;

const duplicateTrigger = trigger => `Duplicate definitions for trigger ${trigger.className}.${trigger.triggerName}`;

const invalidTrigger = trigger => `Invalid trigger "${trigger.triggerName}" for class "${trigger.className}"`;

const invalidTriggerName = trigger => `Invalid trigger name "${trigger.triggerName}" for class "${trigger.className}"`;

const invalidTriggerClass = trigger => `Invalid trigger class "${trigger.className}" for trigger of type "${trigger.triggerName}"`;

const invalidFunction = func => `Invalid function "${func.functionName}"`;

const duplicateFunction = func => `Duplicate definitions for function ${func.functionName}`;

const invalidPermission = (permName, className) => `Invalid permission ${permName} on collection ${className}; permission values must be \`true\``;

const prettyPrintValidationError = error => error;

exports.duplicateClass = duplicateClass;
exports.invalidIndex = invalidIndex;
exports.duplicateIndex = duplicateIndex;
exports.duplicateColumn = duplicateColumn;
exports.duplicateTrigger = duplicateTrigger;
exports.invalidTrigger = invalidTrigger;
exports.invalidTriggerName = invalidTriggerName;
exports.invalidTriggerClass = invalidTriggerClass;
exports.invalidFunction = invalidFunction;
exports.duplicateFunction = duplicateFunction;
exports.invalidPermission = invalidPermission;
exports.prettyPrintValidationError = prettyPrintValidationError;