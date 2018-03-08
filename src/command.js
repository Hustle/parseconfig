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
export type AddIndexCommand = {
  type: 'AddIndex',
  collection: string,
  name: string,
  definition: IndexDefinition
}
export type DeleteIndexCommand = {
  type: 'DeleteIndex',
  collection: string,
  columnName: string
}
export type AddFunctionCommand = {
  type: 'AddFunction',
  definition: FunctionDefinition
}
export type DeleteFunctionCommand = {
  type: 'DeleteFunction',
  functionName: string
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
    columnName: name
  }
);
DeleteIndex.type = 'DeleteIndex';

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
