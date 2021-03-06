// @flow

export type Schema = {
  collections: Array<CollectionDefinition>,
  functions: Array<FunctionDefinition>,
  triggers: Array<TriggerDefinition>
}

export type CollectionDefinition = {
  className: string,
  fields: { [string]: ColumnDefinition },
  classLevelPermissions: CollectionPermissions,
  indexes?: { [string]: IndexDefinition }
}

export type ColumnDefinition = {
  type: string,
  targetClass?: string
}

export type IndexDefinition = { [string]: number }

export type CollectionPermissions = {
  find: RolePermissions,
  get: RolePermissions,
  create: RolePermissions,
  update: RolePermissions,
  delete: RolePermissions,
  addField: RolePermissions,
  readUserFields: Array<any>,
  writeUserFields: Array<any>
}

export type RolePermissions = { [string]: boolean }

export type FunctionDefinition = {
  functionName: string,
  url: string
}

// Just here to DRY up the typetime/runtime definitions since
// there is no equivalent of $Keys for array literals.
const triggerTypesObj = {
  beforeSave: null,
  afterSave: null,
  beforeDelete: null,
  afterDelete: null,
};
const triggerTypes = Object.keys(triggerTypesObj);

export type TriggerType = $Keys<typeof triggerTypesObj>;

export type TriggerDefinition = {
  triggerName: TriggerType,
  className: string,
  url: string
}

const prettyPrintCollectionPermissions = (cp: CollectionPermissions) => JSON.stringify(cp);

export {
  triggerTypes,
  prettyPrintCollectionPermissions
}
