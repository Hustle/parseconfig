import assert from 'assert';

import { verifySchema } from '../dist/verifier';

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
  /*
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
  });
  */
});
