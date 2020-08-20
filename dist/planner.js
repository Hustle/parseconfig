'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.planTriggers = exports.planFunctions = exports.planCollections = exports.plan = undefined;

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _command = require('./command');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const plan = (newSchema, oldSchema, hookUrl) => {
  return planCollections(newSchema.collections, oldSchema.collections).concat(planFunctions(newSchema.functions, oldSchema.functions, hookUrl), planTriggers(newSchema.triggers, oldSchema.triggers, hookUrl));
};

const planCollections = (newSchema, oldSchema) => {
  const oldColMap = new Map(oldSchema.map(c => [c.className, c]));
  const newColMap = new Map(newSchema.map(c => [c.className, c]));

  // TODO consolidate loops to improve performance

  const newCollections = (() => {
    const oc = oldColMap;
    const nc = [];
    newSchema.forEach(collection => {
      if (!oc.has(collection.className)) {
        nc.push((0, _command.AddCollection)(collection));
      }
    });
    return nc;
  })();
  const deletedCollections = (() => {
    const nc = newColMap;
    const dc = [];
    oldSchema.forEach(collection => {
      if (!nc.has(collection.className)) {
        dc.push((0, _command.DeleteCollection)(collection.className));
      }
    });
    return dc;
  })();
  const updatedPermissions = (() => {
    const oc = oldColMap;
    const nc = [];
    newSchema.forEach(collection => {
      const old = oc.get(collection.className);
      if (old === undefined) {
        return; // New Collection, handled above
      }
      const newPerms = collection.classLevelPermissions;
      const oldPerms = old.classLevelPermissions;
      if (!(0, _lodash2.default)(newPerms, oldPerms)) {
        nc.push((0, _command.UpdateCollectionPermissions)(collection.className, newPerms, oldPerms));
      }
    });
    return nc;
  })();
  const newColumns = (() => {
    const oc = oldColMap;
    const nc = [];
    newSchema.forEach(collection => {
      const old = oc.get(collection.className);
      if (old === undefined) {
        return; // New Collection, handled above
      }
      const fields = collection.fields;
      Object.keys(fields).forEach(name => {
        const oldField = old.fields[name];
        if (oldField === undefined) {
          nc.push((0, _command.AddColumn)(collection.className, name, fields[name]));
        } else if (!(0, _lodash2.default)(oldField, fields[name])) {
          nc.push((0, _command.UpdateColumn)(collection.className, name, fields[name]));
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
        return; // Deleted Collection, handled above
      }
      const fields = collection.fields;
      Object.keys(fields).forEach(name => {
        const newField = newC.fields[name];
        if (newField === undefined) {
          dc.push((0, _command.DeleteColumn)(collection.className, name));
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
        return; // New Collection, handled above
      }
      const indexes = collection.indexes || {};
      Object.keys(indexes).forEach(name => {
        const oldIndex = (old.indexes || {})[name];
        if (oldIndex === undefined) {
          ni.push((0, _command.AddIndex)(collection.className, name, indexes[name]));
        } else if (!(0, _lodash2.default)(oldIndex, indexes[name])) {
          ni.push((0, _command.UpdateIndex)(collection.className, name, indexes[name]));
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
        return; // Deleted Collection, handled above
      }
      const indexes = collection.indexes || {};
      Object.keys(indexes).forEach(name => {
        const newIndex = (newC.indexes || {})[name];
        if (newIndex === undefined) {
          di.push((0, _command.DeleteIndex)(collection.className, name));
        }
      });
    });
    return di;
  })();

  // Order matters here. New columns must be added before
  // indices which use them
  return newCollections.concat(deletedCollections, updatedPermissions, deletedIndexes, deletedColumns, newColumns, newIndexes);
};

const planFunctions = (newSchema, oldSchema, hookUrl) => {
  const oldFuncMap = new Map(oldSchema.map(c => [c.functionName, c]));
  const newFuncMap = new Map(newSchema.map(c => [c.functionName, c]));

  const newFunctions = (() => {
    const newFuncs = [];
    newSchema.forEach(func => {
      const actualFunc = Object.assign({}, func);
      if (hookUrl) {
        actualFunc.url = hookUrl + func.url;
      }
      const oldFunc = oldFuncMap.get(actualFunc.functionName);
      if (oldFunc === undefined) {
        newFuncs.push((0, _command.AddFunction)(actualFunc));
      } else if (oldFunc.url !== actualFunc.url) {
        newFuncs.push((0, _command.UpdateFunction)(actualFunc));
      }
    });
    return newFuncs;
  })();
  const deletedFunctions = (() => {
    const delFuncs = [];
    oldSchema.forEach(func => {
      const newFunc = newFuncMap.get(func.functionName);
      if (newFunc === undefined) {
        delFuncs.push((0, _command.DeleteFunction)(func.functionName));
      }
    });
    return delFuncs;
  })();

  return deletedFunctions.concat(newFunctions);
};

// TODO triggers can e directly updated via PUT
const planTriggers = (newSchema, oldSchema, hookUrl) => {
  const triggerKey = t => `${t.triggerName}-${t.className}`;

  const oldTriggerMap = new Map(oldSchema.map(t => [triggerKey(t), t]));
  const newTriggerMap = new Map(newSchema.map(t => [triggerKey(t), t]));

  const newTriggers = (() => {
    const newTriggers = [];
    newSchema.forEach(trigger => {
      const actualTrigger = Object.assign({}, trigger);
      if (hookUrl) {
        actualTrigger.url = hookUrl + trigger.url;
      }
      const oldTrigger = oldTriggerMap.get(triggerKey(actualTrigger));
      if (oldTrigger === undefined) {
        newTriggers.push((0, _command.AddTrigger)(actualTrigger));
      } else if (oldTrigger.url !== actualTrigger.url) {
        newTriggers.push((0, _command.UpdateTrigger)(actualTrigger));
      }
    });
    return newTriggers;
  })();
  const deletedTriggers = (() => {
    const delTriggers = [];
    oldSchema.forEach(trigger => {
      const newTrigger = newTriggerMap.get(triggerKey(trigger));
      if (newTrigger === undefined) {
        delTriggers.push((0, _command.DeleteTrigger)(trigger.className, trigger.triggerName));
      }
    });
    return delTriggers;
  })();

  return deletedTriggers.concat(newTriggers);
};

exports.plan = plan;
exports.planCollections = planCollections;
exports.planFunctions = planFunctions;
exports.planTriggers = planTriggers;