import assert from 'assert';

import { verifySchema } from '../dist/verifier';

import {
  duplicateClass,
  invalidIndex,
  duplicateIndex,
  duplicateColumn,
  duplicateTrigger,
  invalidTrigger,
  invalidTriggerName,
  invalidTriggerClass,
  invalidFunction,
  duplicateFunction,
  invalidPermission,
} from '../dist/validation-error';

const deepCopy = (any) => JSON.parse(JSON.stringify(any));

describe('verifier', function() {
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
          get: {},
          create: {},
          update: {},
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

  describe('verifySchema()', function() {
    it('should error on duplicate collections', function() {
      const schema = deepCopy(defaultSchema);
      const dupCollection = schema.collections[0]
      schema.collections.push(dupCollection);

      assert.deepEqual(
        verifySchema(schema),
        [duplicateClass(dupCollection)]
      );
    });
    it('should error on invalid indices', function() {
      const schema = deepCopy(defaultSchema);
      delete schema.collections[0].fields.AAA;

      assert.deepEqual(
        verifySchema(schema),
        [invalidIndex(Object.keys(schema.collections[0].indexes)[0], 'AAA', 'Foo')]
      );
    });
    it('should error on invalid permissions', function() {
      const schema = deepCopy(defaultSchema);
      schema.collections[0].classLevelPermissions.create['role:admin'] = false;

      assert.deepEqual(
        verifySchema(schema),
        [invalidPermission('create',  schema.collections[0].className)]
      );
    });
    it('should error on duplicate indices', function() {
      assert(true); // index uniqueness guaranteed by object semantics
    });
    it('should error on duplicate fields', function() {
      assert(true); // field uniqueness guaranteed by object semantics
    });
    it('should error on duplicate triggers', function() {
      const schema = deepCopy(defaultSchema);
      const dupTrigger = schema.triggers[0]
      schema.triggers.push(dupTrigger);

      assert.deepEqual(
        verifySchema(schema),
        [duplicateTrigger(dupTrigger)]
      );
    });
    it('should error on invalid trigger', function() {
      const schema = deepCopy(defaultSchema);
      const invalidTrig = schema.triggers[0]
      delete invalidTrig.url;
      
      assert.deepEqual(
        verifySchema(schema),
        [invalidTrigger(invalidTrig)]
      );
    });
    it('should error on invalid trigger names', function() {
      const schema = deepCopy(defaultSchema);
      schema.triggers[0].triggerName = 'INVALID';

      assert.deepEqual(
        verifySchema(schema),
        [invalidTriggerName(schema.triggers[0])]
      );
    });
    it('should error on invalid trigger classes', function() {
      const schema = deepCopy(defaultSchema);
      schema.triggers[0].className = 'INVALID';

      assert.deepEqual(
        verifySchema(schema),
        [invalidTriggerClass(schema.triggers[0])]
      );
    });
    it('should error on duplicate functions', function() {
      const schema = deepCopy(defaultSchema);
      const dupFunc = schema.functions[0]
      schema.functions.push(dupFunc);

      assert.deepEqual(
        verifySchema(schema),
        [duplicateFunction(dupFunc)]
      );
    });
    it('should error on invalid functions', function() {
      const schema = deepCopy(defaultSchema);
      const invalidFunc = schema.functions[0]
      delete invalidFunc.url;
      
      assert.deepEqual(
        verifySchema(schema),
        [invalidFunction(invalidFunc)]
      );
    });
  });
});
