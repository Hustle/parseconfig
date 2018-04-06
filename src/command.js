// @flow

import type {
  Schema,
  CollectionDefinition,
  ColumnDefinition,
  IndexDefinition,
  CollectionPermissions,
  RolePermissions,
  FunctionDefinition,
  TriggerDefinition,
  TriggerType,
} from './schema';

import {
  prettyPrintCollectionPermissions,
} from './schema';

export type AddCollectionCommand = {
  type: 'AddCollection',
  definition: CollectionDefinition
}
export type DeleteCollectionCommand = {
  type: 'DeleteCollection',
  collectionName: string
}
export type AddColumnCommand = {
  type: 'AddColumn',
  collection: string,
  name: string,
  definition: ColumnDefinition
}
export type DeleteColumnCommand = {
  type: 'DeleteColumn',
  collection: string,
  columnName: string
}
export type UpdateColumnCommand = {
  type: 'UpdateColumn',
  collection: string,
  name: string,
  definition: ColumnDefinition
}
export type AddIndexCommand = {
  type: 'AddIndex',
  collection: string,
  name: string,
  definition: IndexDefinition
}
export type DeleteIndexCommand = {
  type: 'DeleteIndex',
  collection: string,
  indexName: string
}
export type UpdateIndexCommand = {
  type: 'UpdateIndex',
  collection: string,
  name: string,
  definition: IndexDefinition
}
export type AddFunctionCommand = {
  type: 'AddFunction',
  definition: FunctionDefinition
}
export type DeleteFunctionCommand = {
  type: 'DeleteFunction',
  functionName: string
}
export type UpdateFunctionCommand = {
  type: 'UpdateFunction',
  definition: FunctionDefinition
}
export type AddTriggerCommand = {
  type: 'AddTrigger',
  definition: TriggerDefinition
}
export type DeleteTriggerCommand = {
  type: 'DeleteTrigger',
  className: string,
  triggerName: TriggerType
}
export type UpdateTriggerCommand = {
  type: 'UpdateTrigger',
  definition: TriggerDefinition
}
export type UpdateCollectionPermissionsCommand = {
  type: 'UpdateCollectionPermissions',
  collection: string,
  definition: CollectionPermissions
}
export type Command
  = AddCollectionCommand
  | DeleteCollectionCommand
  | UpdateCollectionPermissionsCommand
  | AddColumnCommand
  | DeleteColumnCommand
  | UpdateColumnCommand
  | AddIndexCommand
  | DeleteIndexCommand
  | UpdateIndexCommand
  | AddFunctionCommand
  | DeleteFunctionCommand
  | UpdateFunctionCommand
  | AddTriggerCommand
  | DeleteTriggerCommand
  | UpdateTriggerCommand

const AddCollection = (collection: CollectionDefinition): AddCollectionCommand => (
  {
    type: AddCollection.type,
    definition: collection
  }
);
AddCollection.type = 'AddCollection';

const DeleteCollection = (collection: string): DeleteCollectionCommand => (
  {
    type: DeleteCollection.type,
    collectionName: collection
  }
);
DeleteCollection.type = 'DeleteCollection';

const AddColumn = (collection: string, name: string, definition: ColumnDefinition): AddColumnCommand => (
  {
    type: AddColumn.type,
    collection,
    name,
    definition
  }
);
AddColumn.type = 'AddColumn';

const DeleteColumn = (collection: string, name: string): DeleteColumnCommand => (
  {
    type: DeleteColumn.type,
    collection,
    columnName: name
  }
);
DeleteColumn.type = 'DeleteColumn';

const UpdateColumn = (collection: string, name: string, definition: ColumnDefinition): UpdateColumnCommand => (
  {
    type: UpdateColumn.type,
    collection,
    name,
    definition
  }
);
UpdateColumn.type = 'UpdateColumn';

const AddIndex = (collection: string, name: string, definition: IndexDefinition): AddIndexCommand => (
  {
    type: AddIndex.type,
    collection,
    name,
    definition
  }
);
AddIndex.type = 'AddIndex';

const DeleteIndex = (collection: string, name: string): DeleteIndexCommand => (
  {
    type: DeleteIndex.type,
    collection,
    indexName: name
  }
);
DeleteIndex.type = 'DeleteIndex';

const UpdateIndex = (collection: string, name: string, definition: IndexDefinition): UpdateIndexCommand => (
  {
    type: UpdateIndex.type,
    collection,
    name,
    definition
  }
);
UpdateIndex.type = 'UpdateIndex';

const AddFunction = (definition: FunctionDefinition): AddFunctionCommand => (
  {
    type: AddFunction.type,
    definition
  }
);
AddFunction.type = 'AddFunction';

const DeleteFunction = (name: string): DeleteFunctionCommand => (
  {
    type: DeleteFunction.type,
    functionName: name
  }
);
DeleteFunction.type = 'DeleteFunction';

const UpdateFunction = (definition: FunctionDefinition): UpdateFunctionCommand => (
  {
    type: UpdateFunction.type,
    definition
  }
);
UpdateFunction.type = 'UpdateFunction';

const AddTrigger = (definition: TriggerDefinition): AddTriggerCommand => (
  {
    type: AddTrigger.type,
    definition
  }
);
AddTrigger.type = 'AddTrigger';

const DeleteTrigger = (className: string, triggerType: TriggerType): DeleteTriggerCommand => (
  {
    type: DeleteTrigger.type,
    className,
    triggerName: triggerType
  }
);
DeleteTrigger.type = 'DeleteTrigger';

const UpdateTrigger = (definition: TriggerDefinition): UpdateTriggerCommand => (
  {
    type: UpdateTrigger.type,
    definition
  }
);
UpdateTrigger.type = 'UpdateTrigger';

const UpdateCollectionPermissions = (
  collection: string,
  definition: CollectionPermissions
): UpdateCollectionPermissionsCommand => (
  {
    type: UpdateCollectionPermissions.type,
    collection,
    definition
  }
);
UpdateCollectionPermissions.type = 'UpdateCollectionPermissions';

const prettyPrintCommand = (command: Command): string => {
  switch (command.type) {
    case AddCollection.type:
      return `Add Collection "${command.definition.className}"`;
    case DeleteCollection.type:
      return `Delete Collection "${command.collectionName}"`;
    case AddColumn.type:
      return `Add Column "${command.name}" to "${command.collection}"`;
    case DeleteColumn.type:
      return `Delete Column "${command.columnName}" from "${command.collection}"`;
    case UpdateColumn.type:
      return `Update Column "${command.name}" on "${command.collection}"`;
    case AddIndex.type:
      return `Add Index "${command.definition.indexName}" to "${command.definition.className}"`;
    case DeleteIndex.type:
      return `Delete Index "${command.indexName}" from "${command.collection}"`;
    case UpdateIndex.type:
      return `Update Index "${command.definition.indexName}" on "${command.definition.className}"`;
    case AddFunction.type:
      return `Add Function "${command.definition.functionName}"`;
    case DeleteFunction.type:
      return `Add Function "${command.functionName}"`;
    case UpdateFunction.type:
      return `Update Function "${command.definition.functionName}"`;
    case AddTrigger.type:
      return `Add Trigger "${command.definition.triggerName}" on "${command.definition.className}"`;
    case DeleteTrigger.type:
      return `Delete Trigger "${command.triggerName}" on "${command.className}"`;
    case UpdateTrigger.type:
      return `Update Trigger "${command.definition.triggerName}" on "${command.definition.className}"`;
    case UpdateCollectionPermissions.type:
      return `Update Permissions on class "${command.collection}" to "${prettyPrintCollectionPermissions(command.definition)}"`;
    default:
      return (command: empty); // exhaustiveness check
  }
};


export {
  AddCollection,
  DeleteCollection,
  AddColumn,
  DeleteColumn,
  UpdateColumn,
  AddIndex,
  DeleteIndex,
  UpdateIndex,
  AddFunction,
  DeleteFunction,
  UpdateFunction,
  AddTrigger,
  DeleteTrigger,
  UpdateTrigger,
  UpdateCollectionPermissions,
  prettyPrintCommand,
}
