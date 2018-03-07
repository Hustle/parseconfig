// @flow

import type {
  ParseSchemaResponse,
  Schema,
  CollectionDefinition,
  FunctionDefinition,
  ColumnDefinition,
  IndexDefinition,
  TriggerDefinition,
} from './schema';

import {
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
} from './command';

import type {
  Command
} from './command';

const deepEquals = (a: any, b: any): boolean => {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

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
        const oldField = old.fields[name];
        if (oldField === undefined || !deepEquals(oldField, fields[name])) {
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
        const newField = newC.fields[name];
        if (newField === undefined || !deepEquals(newField, fields[name])) {
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
        const oldIndex = old.indexes[name];
        if (oldIndex === undefined || !deepEquals(oldIndex, indexes[name])) {
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
        const newIndex = newC.indexes[name];
        if (newIndex === undefined || !deepEquals(newIndex, indexes[name])) {
          di.push(DeleteIndex(collection.className, name));
        }
      });
    });
    return di;
  })();

  // Order matters here. When a column or index is modified the old column/index
  // needs to be deleted before the new one is created.
  return newCollections.concat(
    deletedCollections,
    deletedColumns,
    newColumns,
    deletedIndexes,
    newIndexes,
  )
};

// TODO functions can be directly update via the API
const planFunctions = (
  newSchema: Array<FunctionDefinition>,
  oldSchema: Array<FunctionDefinition>
): Array<Command> => {
  const oldFuncMap = new Map(oldSchema.map(c => [c.functionName, c]));
  const newFuncMap = new Map(newSchema.map(c => [c.functionName, c]));

  const newFunctions = (() => {
    const newFuncs = [];
    newSchema.forEach(func => {
      const oldFunc = oldFuncMap.get(func.functionName);
      if (oldFunc === undefined || oldFunc.path !== func.path) {
        newFuncs.push(AddFunction(func));
      }
    });
    return newFuncs;
  })();
  const deletedFunctions = (() => {
    const delFuncs = [];
    oldSchema.forEach(func => {
      const newFunc = newFuncMap.get(func.functionName);
      if (newFunc === undefined || newFunc.path !== func.path) {
        delFuncs.push(DeleteFunction(func.functionName));
      }
    });
    return delFuncs;
  })();
  
  return deletedFunctions.concat(newFunctions);
};

// TODO triggers can e directly updated via PUT
const planTriggers = (
  newSchema: Array<TriggerDefinition>,
  oldSchema: Array<TriggerDefinition>
): Array<Command> => {
  const triggerKey = (t: TriggerDefinition): string => `${t.triggerName}-${t.className}`;
  
  const oldTriggerMap = new Map(oldSchema.map(t => [triggerKey(t), t]));
  const newTriggerMap = new Map(newSchema.map(t => [triggerKey(t), t]));

  const newTriggers = (() => {
    const newTriggers = [];
    newSchema.forEach(trigger => {
      const oldTrigger = oldTriggerMap.get(triggerKey(trigger));
      if (oldTrigger === undefined || oldTrigger.path !== trigger.path) {
        newTriggers.push(AddTrigger(trigger));
      }
    });
    return newTriggers;
  })();
  const deletedTriggers = (() => {
    const delTriggers = [];
    oldSchema.forEach(trigger => {
      const newTrigger = newTriggerMap.get(triggerKey(trigger));
      if (newTrigger === undefined || newTrigger.path !== trigger.path) {
        delTriggers.push(DeleteTrigger(trigger.className, trigger.triggerName));
      }
    });
    return delTriggers;
  })();
  
  return deletedTriggers.concat(newTriggers);
};

export {
  planCollections,
  planFunctions,
  planTriggers,
}
