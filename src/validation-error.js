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

const invalidIndex = (indexName: string, fieldName: string, collectionName: string): ValidationError => (
  `Invalid index: ${indexName} on collection ${collectionName} includes non-existent column "${fieldName}"`
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
  `Invalid trigger "${trigger.triggerName}" for class "${trigger.className}"`
);

const invalidTriggerName = (trigger: TriggerDefinition): ValidationError => (
  `Invalid trigger name "${trigger.triggerName}" for class "${trigger.className}"`
);

const invalidTriggerClass = (trigger: TriggerDefinition): ValidationError => (
  `Invalid trigger class "${trigger.className}" for trigger of type "${trigger.triggerName}"`
);

const invalidFunction = (func: FunctionDefinition): ValidationError => (
  `Invalid function "${func.functionName}"`
);

const duplicateFunction = (func: FunctionDefinition): ValidationError => (
  `Duplicate definitions for function ${func.functionName}`
);

const invalidPermission = (permName: string, className: string): ValidationError => (
  `Invalid permission ${permName} on collection ${className}; permission values must be \`true\``
);

const prettyPrintValidationError = (error: ValidationError): string => error;

export {
  duplicateClass,
  invalidIndex,
  duplicateIndex,
  duplicateColumn,
  duplicateTrigger,
  invalidTrigger,
  invalidTriggerName,
  invalidTriggerClass,
  invalidFunction,
  duplicateFunction,
  invalidPermission,
  prettyPrintValidationError
}
