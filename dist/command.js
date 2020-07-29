'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prettyPrintCommand = exports.UpdateCollectionPermissions = exports.UpdateTrigger = exports.DeleteTrigger = exports.AddTrigger = exports.UpdateFunction = exports.DeleteFunction = exports.AddFunction = exports.UpdateIndex = exports.DeleteIndex = exports.AddIndex = exports.UpdateColumn = exports.DeleteColumn = exports.AddColumn = exports.DeleteCollection = exports.AddCollection = undefined;

var _schema = require('./schema');

const AddCollection = collection => ({
  type: AddCollection.type,
  definition: collection
});
AddCollection.type = 'AddCollection';

const DeleteCollection = collection => ({
  type: DeleteCollection.type,
  collectionName: collection
});
DeleteCollection.type = 'DeleteCollection';

const AddColumn = (collection, name, definition) => ({
  type: AddColumn.type,
  collection,
  name,
  definition
});
AddColumn.type = 'AddColumn';

const DeleteColumn = (collection, name) => ({
  type: DeleteColumn.type,
  collection,
  columnName: name
});
DeleteColumn.type = 'DeleteColumn';

const UpdateColumn = (collection, name, definition) => ({
  type: UpdateColumn.type,
  collection,
  name,
  definition
});
UpdateColumn.type = 'UpdateColumn';

const AddIndex = (collection, name, definition) => ({
  type: AddIndex.type,
  collection,
  name,
  definition
});
AddIndex.type = 'AddIndex';

const DeleteIndex = (collection, name) => ({
  type: DeleteIndex.type,
  collection,
  indexName: name
});
DeleteIndex.type = 'DeleteIndex';

const UpdateIndex = (collection, name, definition) => ({
  type: UpdateIndex.type,
  collection,
  name,
  definition
});
UpdateIndex.type = 'UpdateIndex';

const AddFunction = definition => ({
  type: AddFunction.type,
  definition
});
AddFunction.type = 'AddFunction';

const DeleteFunction = name => ({
  type: DeleteFunction.type,
  functionName: name
});
DeleteFunction.type = 'DeleteFunction';

const UpdateFunction = definition => ({
  type: UpdateFunction.type,
  definition
});
UpdateFunction.type = 'UpdateFunction';

const AddTrigger = definition => ({
  type: AddTrigger.type,
  definition
});
AddTrigger.type = 'AddTrigger';

const DeleteTrigger = (className, triggerType) => ({
  type: DeleteTrigger.type,
  className,
  triggerName: triggerType
});
DeleteTrigger.type = 'DeleteTrigger';

const UpdateTrigger = definition => ({
  type: UpdateTrigger.type,
  definition
});
UpdateTrigger.type = 'UpdateTrigger';

const UpdateCollectionPermissions = (collection, definition, oldDefinition) => ({
  type: UpdateCollectionPermissions.type,
  collection,
  definition,
  oldDefinition
});
UpdateCollectionPermissions.type = 'UpdateCollectionPermissions';

const prettyPrintCommand = command => {
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
      return `Add Index "${command.name}" to "${command.collection}"`;
    case DeleteIndex.type:
      return `Delete Index "${command.indexName}" from "${command.collection}"`;
    case UpdateIndex.type:
      return `Update Index "${command.definition.indexName}" on "${command.definition.className}"`;
    case AddFunction.type:
      return `Add Function "${command.definition.functionName}"`;
    case DeleteFunction.type:
      return `Delete Function "${command.functionName}"`;
    case UpdateFunction.type:
      return `Update Function "${command.definition.functionName}"`;
    case AddTrigger.type:
      return `Add Trigger "${command.definition.triggerName}" on "${command.definition.className}"`;
    case DeleteTrigger.type:
      return `Delete Trigger "${command.triggerName}" on "${command.className}"`;
    case UpdateTrigger.type:
      return `Update Trigger "${command.definition.triggerName}" on "${command.definition.className}"`;
    case UpdateCollectionPermissions.type:
      return `Update Permissions on class "${command.collection}" to "${(0, _schema.prettyPrintCollectionPermissions)(command.definition)}" from "${(0, _schema.prettyPrintCollectionPermissions)(command.oldDefinition)}"`;
    default:
      return command; // exhaustiveness check
  }
};

exports.AddCollection = AddCollection;
exports.DeleteCollection = DeleteCollection;
exports.AddColumn = AddColumn;
exports.DeleteColumn = DeleteColumn;
exports.UpdateColumn = UpdateColumn;
exports.AddIndex = AddIndex;
exports.DeleteIndex = DeleteIndex;
exports.UpdateIndex = UpdateIndex;
exports.AddFunction = AddFunction;
exports.DeleteFunction = DeleteFunction;
exports.UpdateFunction = UpdateFunction;
exports.AddTrigger = AddTrigger;
exports.DeleteTrigger = DeleteTrigger;
exports.UpdateTrigger = UpdateTrigger;
exports.UpdateCollectionPermissions = UpdateCollectionPermissions;
exports.prettyPrintCommand = prettyPrintCommand;