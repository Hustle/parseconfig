// @flow

import type {
  ParseSchemaResponse,
  Schema,
  CollectionDefinition,
  ColumnDefinition,
  IndexDefinition,
  CollectionPermissions,
  RolePermissions,
  FunctionDefinition,
  TriggerDefinition,
  TriggerType
} from './schema';

export type AddCollectionCommand = {
  command: 'AddCollection',
  definition: CollectionDefinition
}
export type DeleteCollectionCommand = {
  command: 'DeleteCollection',
  collectionName: string
}
export type AddColumnCommand = {
  command: 'AddColumn',
  collection: string,
  name: string,
  definition: ColumnDefinition
}
export type DeleteColumnCommand = {
  command: 'DeleteColumn',
  collection: string,
  columnName: string
}
export type AddIndexCommand = {
  command: 'AddIndex',
  collection: string,
  name: string,
  definition: IndexDefinition
}
export type DeleteIndexCommand = {
  command: 'DeleteIndex',
  collection: string,
  columnName: string
}
export type AddFunctionCommand = {
  command: 'AddFunction',
  definition: FunctionDefinition
}
export type DeleteFunctionCommand = {
  command: 'DeleteFunction',
  functionName: string
}
export type AddTriggerCommand = {
  command: 'AddTrigger',
  definition: TriggerDefinition
}
export type DeleteTriggerCommand = {
  command: 'DeleteTrigger',
  className: string,
  triggerName: TriggerType
}
export type Command
  = AddCollectionCommand
  | DeleteCollectionCommand
  | AddColumnCommand
  | DeleteColumnCommand
  | AddIndexCommand
  | DeleteIndexCommand
  | AddFunctionCommand
  | DeleteFunctionCommand
  | AddTriggerCommand
  | DeleteTriggerCommand

const AddCollection = (collection: CollectionDefinition): AddCollectionCommand => (
  {
    command: AddCollection.command,
    definition: collection
  }
);
AddCollection.command = 'AddCollection';

const DeleteCollection = (collection: string): DeleteCollectionCommand => (
  {
    command: DeleteCollection.command,
    collectionName: collection
  }
);
DeleteCollection.command = 'DeleteCollection';

const AddColumn = (collection: string, name: string, definition: ColumnDefinition): AddColumnCommand => (
  {
    command: AddColumn.command,
    collection,
    name,
    definition
  }
);
AddColumn.command = 'AddColumn';

const DeleteColumn = (collection: string, name: string): DeleteColumnCommand => (
  {
    command: DeleteColumn.command,
    collection,
    columnName: name
  }
);
DeleteColumn.command = 'DeleteColumn';

const AddIndex = (collection: string, name: string, definition: IndexDefinition): AddIndexCommand => (
  {
    command: AddIndex.command,
    collection,
    name,
    definition
  }
);
AddIndex.command = 'AddIndex';

const DeleteIndex = (collection: string, name: string): DeleteIndexCommand => (
  {
    command: DeleteIndex.command,
    collection,
    columnName: name
  }
);
DeleteIndex.command = 'DeleteIndex';

const AddFunction = (definition: FunctionDefinition): AddFunctionCommand => (
  {
    command: AddFunction.command,
    definition
  }
);
AddFunction.command = 'AddFunction';

const DeleteFunction = (name: string): DeleteFunctionCommand => (
  {
    command: DeleteFunction.command,
    functionName: name
  }
);
DeleteFunction.command = 'DeleteFunction';

const AddTrigger = (definition: TriggerDefinition): AddTriggerCommand => (
  {
    command: AddTrigger.command,
    definition
  }
);
AddTrigger.command = 'AddTrigger';

const DeleteTrigger = (className: string, triggerType: TriggerType): DeleteTriggerCommand => (
  {
    command: DeleteTrigger.command,
    className,
    triggerName: triggerType
  }
);
DeleteTrigger.command = 'DeleteTrigger';

export {
  AddCollection,
  DeleteCollection,
  AddColumn,
  DeleteColumn,
  AddIndex,
  DeleteIndex,
  AddFunction,
  DeleteFunction,
  AddTrigger,
  DeleteTrigger,
}
