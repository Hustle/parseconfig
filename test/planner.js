import assert from 'assert';

import { planCollections } from '../dist/planner';

import {
  AddCollection,
  DeleteCollection,
  AddColumn,
  DeleteColumn,
  AddIndex,
  DeleteIndex
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
    functions: [],
    triggers: []
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
  });
});
