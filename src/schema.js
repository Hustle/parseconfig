// @flow

export type ParseSchemaResponse = {
  results: Array<CollectionDefinition>
}

export type Schema = {
  collections: Array<CollectionDefinition>
}

export type CollectionDefinition = {
  className: string,
  fields: { [string]: ColumnDefinition },
  classLevelPermissions: CollectionPermissions,
  indexes: { [string]: IndexDefinition }
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
