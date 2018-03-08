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
  columnName: string
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
export type Command
  = AddCollectionCommand
  | DeleteCollectionCommand
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
    columnName: name
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
}
