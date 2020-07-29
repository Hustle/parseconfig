"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


// Just here to DRY up the typetime/runtime definitions since
// there is no equivalent of $Keys for array literals.
const triggerTypesObj = {
  beforeSave: null,
  afterSave: null,
  beforeDelete: null,
  afterDelete: null
};

const triggerTypes = Object.keys(triggerTypesObj);

const prettyPrintCollectionPermissions = cp => JSON.stringify(cp);

exports.triggerTypes = triggerTypes;
exports.prettyPrintCollectionPermissions = prettyPrintCollectionPermissions;