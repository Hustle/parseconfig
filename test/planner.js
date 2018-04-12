import assert from 'assert';

import { planCollections, planFunctions, planTriggers } from '../dist/planner';

import {
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
  UpdateCollectionPermissions,
} from '../dist/command';

const deepCopy = (any) => JSON.parse(JSON.stringify(any));

describe('planner', function() {
  const defaultSchema = {
    collections: [
      {
        className: 'Foo',
        fields: {
          'AAA': {
            type: 'String'
          },
          'AAB': {
            type: 'String'
          }
        },
        indexes: {
          AAA_index: {
            AAA: 1
          }
        },
        classLevelPermissions: {
          find: {
            ['role:user']: true
          },
          create: {},
          update: {},
          get: {},
          delete: {},
          addField: {}
        }
      },
      {
        className: 'Bar',
        fields: {
          'BAA': {
            type: 'String'
          },
          'BAB': {
            type: 'String'
          }
        },
        indexes: {}
      }
    ],
    functions: [
      {
        functionName: 'getFoobar',
        url: '/getFoobar'
      },
      {
        functionName: 'addFoobar',
        url: '/addFoobar'
      }
    ],
    triggers: [
      {
        className: 'Foo',
        triggerName: 'beforeSave',
        url: '/foo/beforeSave'
      },
      {
        className: 'Bar',
        triggerName: 'afterSave',
        url: '/bar/afterSave'
      }
    ]
  }
  
  describe('planCollections()', function() {
    it('should add a missing collection', function() {
      const newSchema = deepCopy(defaultSchema.collections);
      const oldSchema = deepCopy(defaultSchema.collections).slice(1);
      
      const newColl = deepCopy(defaultSchema.collections)[0];
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [AddCollection(newColl)]
      );
    });
    it('should delete a removed collection', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections).slice(1);
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [DeleteCollection('Foo')]
      );
    });
    it('should add a new column', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      const newCol = AddColumn(
        oldSchema[0].className,
        'AAA',
        deepCopy(oldSchema[0].fields.AAA)
      );
      delete oldSchema[0].fields.AAA
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [newCol]
      );
    });
    it('should delete a removed column', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      const delCol = DeleteColumn(
        newSchema[0].className,
        'AAA'
      );
      delete newSchema[0].fields.AAA
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [delCol]
      );
    });
    it('should update a changed column', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      newSchema[0].fields.AAA.type = 'object';
      const newCol = UpdateColumn(
        newSchema[0].className,
        'AAA',
        deepCopy(newSchema[0].fields.AAA)
      );
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [newCol]
      );
    });
    it('should add a new index', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      const newIndex = AddIndex(
        oldSchema[0].className,
        'AAA_index',
        deepCopy(oldSchema[0].indexes.AAA_index)
      );
      delete oldSchema[0].indexes.AAA_index
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [newIndex]
      );
    });
    it('should delete a removed index', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      const delCol = DeleteIndex(
        newSchema[0].className,
        'AAA_index'
      );
      delete newSchema[0].indexes.AAA_index
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [delCol]
      );
    });
    it('should ignore private indices with the appropriate flag', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      oldSchema[0].indexes['_private_index'] = { _created_at: 1 };
      assert.deepEqual(
        planCollections(newSchema, oldSchema, true),
        []
      );
    });
    it('should delete private indices without the appropriate flag', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      const delCol = DeleteIndex(
        newSchema[0].className,
        '_private_index'
      );
      oldSchema[0].indexes['_private_index'] = { _created_at: 1 };
      assert.deepEqual(
        planCollections(newSchema, oldSchema, false),
        [delCol]
      );
    });
    it('should update a changed index', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      newSchema[0].indexes.AAA_index.AAB = 2
      const newIndex = UpdateIndex(
        newSchema[0].className,
        'AAA_index',
        deepCopy(newSchema[0].indexes.AAA_index)
      );
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [newIndex]
      );
    });
    it('should update changed permisions', function() {
      const oldSchema = deepCopy(defaultSchema.collections);
      const newSchema = deepCopy(defaultSchema.collections);

      newSchema[0].classLevelPermissions.create['role:user'] = true
      const newPerms = UpdateCollectionPermissions(
        newSchema[0].className,
        deepCopy(newSchema[0].classLevelPermissions)
      );
      assert.deepEqual(
        planCollections(newSchema, oldSchema),
        [newPerms]
      );
    });
  });

  describe('planFunctions()', function() {
    it('should add a new function', function() {
      const oldSchema = deepCopy(defaultSchema.functions).slice(1);
      const newSchema = deepCopy(defaultSchema.functions);

      const newFunc = AddFunction(
        newSchema[0]
      );
      assert.deepEqual(
        planFunctions(newSchema, oldSchema),
        [newFunc]
      );
    });
    it('should delete a removed function', function() {
      const oldSchema = deepCopy(defaultSchema.functions);
      const newSchema = deepCopy(defaultSchema.functions).slice(1);

      const delFunc = DeleteFunction(
        oldSchema[0].functionName
      );
      assert.deepEqual(
        planFunctions(newSchema, oldSchema),
        [delFunc]
      );
    });
    it('should update a changed function', function() {
      const oldSchema = deepCopy(defaultSchema.functions);
      const newSchema = deepCopy(defaultSchema.functions);

      newSchema[0].url = '/some/other/path';
      const newFunc = UpdateFunction(
        newSchema[0]
      );
      assert.deepEqual(
        planFunctions(newSchema, oldSchema),
        [newFunc]
      );
    });
  });

  describe('planTriggers()', function() {
    it('should add a new trigger', function() {
      const oldSchema = deepCopy(defaultSchema.triggers).slice(1);
      const newSchema = deepCopy(defaultSchema.triggers);

      const newFunc = AddTrigger(
        newSchema[0]
      );
      assert.deepEqual(
        planTriggers(newSchema, oldSchema),
        [newFunc]
      );
    });
    it('should delete a removed trigger', function() {
      const oldSchema = deepCopy(defaultSchema.triggers);
      const newSchema = deepCopy(defaultSchema.triggers).slice(1);

      const delFunc = DeleteTrigger(
        oldSchema[0].className,
        oldSchema[0].triggerName
      );
      assert.deepEqual(
        planTriggers(newSchema, oldSchema),
        [delFunc]
      );
    });
    it('should update a changed trigger', function() {
      const oldSchema = deepCopy(defaultSchema.triggers);
      const newSchema = deepCopy(defaultSchema.triggers);

      newSchema[0].url = '/some/other/path';
      const newFunc = UpdateTrigger(
        newSchema[0]
      );
      assert.deepEqual(
        planTriggers(newSchema, oldSchema),
        [newFunc]
      );
    });
  });
});
