// @flow
import type {
  ParseSchemaResponse,
  Schema,
  CollectionDefinition,
  ColumnDefinition,
  IndexDefinition,
  CollectionPermissions,
  RolePermissions
} from './schema';

import {
  AddCollection,
  DeleteCollection,
  AddColumn,
  DeleteColumn,
  AddIndex,
  DeleteIndex
} from './command';

import type {
  Command
} from './command';

const planCollections = (
  newSchema: Array<CollectionDefinition>,
  oldSchema: Array<CollectionDefinition>
): Array<Command> => {
  const oldColMap = new Map(oldSchema.map(c => [c.className, c]));
  const newColMap = new Map(newSchema.map(c => [c.className, c]));

  // TODO consolidate loops to improve performance
  
  const newCollections = (() => {
    const oc = oldColMap;
    const nc = [];
    newSchema.forEach(collection => {
      if (!oc.has(collection.className)) {
        nc.push(AddCollection(collection));
      }
    });
    return nc;
  })();
  const deletedCollections = (() => {
    const nc = newColMap;
    const dc = [];
    oldSchema.forEach(collection => {
      if (!nc.has(collection.className)) {
        dc.push(DeleteCollection(collection.className));
      }
    });
    return dc;
  })();
  const newColumns = (() => {
    const oc = oldColMap;
    const nc = [];
    newSchema.forEach(collection => {
      const old = oc.get(collection.className);
      if (old === undefined) {
        return;
      }
      const fields: { [string]: ColumnDefinition } = collection.fields;
      Object.keys(fields).forEach((name) => {
        if (old.fields[name] === undefined) {
          nc.push(AddColumn(collection.className, name, fields[name]));
        }
      });
    });
    return nc;
  })();
  // TODO handle changes to column definition
  const deletedColumns = (() => {
    const nc = newColMap;
    const dc = [];
    oldSchema.forEach(collection => {
      const newC = nc.get(collection.className);
      if (newC === undefined) {
        return;
      }
      const fields: { [string]: ColumnDefinition } = collection.fields;
      Object.keys(fields).forEach((name) => {
        if (newC.fields[name] === undefined) {
          dc.push(DeleteColumn(collection.className, name));
        }
      });
    });
    return dc;
  })();
  const newIndexes = (() => {
    const oc = oldColMap;
    const ni = [];
    newSchema.forEach(collection => {
      const old = oc.get(collection.className);
      if (old === undefined) {
        return;
      }
      const indexes: { [string]: IndexDefinition } = collection.indexes;
      Object.keys(indexes).forEach((name) => {
        if (old.indexes[name] === undefined) {
          ni.push(AddIndex(collection.className, name, indexes[name]));
        }
      });
    });
    return ni;
  })();
  // TODO handle changes to index definition
  const deletedIndexes = (() => {
    const nc = newColMap;
    const di = [];
    oldSchema.forEach(collection => {
      const newC = nc.get(collection.className);
      if (newC === undefined) {
        return;
      }
      const indexes: { [string]: IndexDefinition } = collection.indexes;
      Object.keys(indexes).forEach((name) => {
        if (newC.indexes[name] === undefined) {
          di.push(DeleteIndex(collection.className, name));
        }
      });
    });
    return di;
  })();
  
  return newCollections.concat(
    deletedCollections,
    newColumns,
    deletedColumns,
    newIndexes,
    deletedIndexes
  )
};

export {
  planCollections
}
