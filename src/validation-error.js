// @flow

import type {
  CollectionDefinition,
  FunctionDefinition,
  IndexDefinition,
  TriggerDefinition,
} from './schema';

// ValidationErrors are strings at runtime
export opaque type ValidationError = string;

const duplicateClass = (collection: CollectionDefinition): ValidationError => (
  `Duplicate definitions for class ${collection.className}`
);

const invalidIndex = (indexName: string, fieldName: string): ValidationError => (
  `Invalid index: ${indexName} includes non-existant column "${fieldName}"`
);

const duplicateIndex = (index: string, className: string): ValidationError => (
  `Duplicate definitions for index ${index} on ${className}`
);

const duplicateColumn = (field: string, className: string): ValidationError => (
  `Duplicate definitions for field ${field} on ${className}`
);

const duplicateTrigger = (trigger: TriggerDefinition): ValidationError => (
  `Duplicate definitions for trigger ${trigger.className}.${trigger.triggerName}`
);

const invalidTrigger = (trigger: TriggerDefinition): ValidationError => (
  `Invalid trigger name "${trigger.triggerName}" for class "${trigger.className}"`
);

const duplicateFunction = (func: FunctionDefinition): ValidationError => (
  `Duplicate definitions for function ${func.functionName}`
);

const prettyPrintValidationError = (error: ValidationError): string => error;

export {
  duplicateClass,
  invalidIndex,
  duplicateIndex,
  duplicateColumn,
  duplicateTrigger,
  invalidTrigger,
  duplicateFunction,
  prettyPrintValidationError
}
