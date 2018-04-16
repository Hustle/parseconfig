import assert from 'assert';

import { reset, getSchema, apply, emptySchema } from './util';
import { consoleLogger } from '../dist/logger';

const deepCopy = (any) => JSON.parse(JSON.stringify(any));

const defaultSchema = {
  collections: [
    {
      className: 'Foo',
      fields: {
        objectId: {
          type: 'String'
        },
        createdAt: {
          type: 'Date'
        },
        updatedAt: {
          type: 'Date'
        },
        ACL: {
          type: 'ACL'
        },
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
        },
        AAB_index: {
          AAB: 1
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
        objectId: {
          type: 'String'
        },
        createdAt: {
          type: 'Date'
        },
        updatedAt: {
          type: 'Date'
        },
        ACL: {
          type: 'ACL'
        },
        'BAA': {
          type: 'String'
        },
        'BAB': {
          type: 'String'
        }
      },
      classLevelPermissions: {
        find: {},
        get: {},
        create: {},
        update: {},
        delete: {},
        addField: {}
      }
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
      triggerName: 'afterSave',
      url: '/foo/afterSave'
    }
  ]
};

describe('collections', () => {
  it('should be added correctly', async () => {
    const oldSchema = deepCopy(defaultSchema);
    const newSchema = deepCopy(defaultSchema);

    oldSchema.collections = oldSchema.collections.slice(0, 1);

    await reset();
    const s1 = await getSchema();
    assert.deepEqual(s1, emptySchema);

    await apply(oldSchema);
    const s2 = await getSchema();
    assert.deepEqual(s2, oldSchema);

    await apply(newSchema);
    const s3 = await getSchema();
    assert.deepEqual(s3, newSchema);
  });
  it('should be removed correctly', async () => {
    const oldSchema = deepCopy(defaultSchema);
    const newSchema = deepCopy(defaultSchema);

    newSchema.collections = newSchema.collections.slice(0, 1);

    await reset();
    const s1 = await getSchema();
    assert.deepEqual(s1, emptySchema);

    await apply(oldSchema);
    const s2 = await getSchema();
    assert.deepEqual(s2, oldSchema);

    await apply(newSchema);
    const s3 = await getSchema();
    assert.deepEqual(s3, newSchema);
  });
  it('should ignore indices when the correct flag is passed', async () => {
    const schema = deepCopy(defaultSchema);
    const expectedSchema = deepCopy(defaultSchema);    

    expectedSchema.collections.forEach(c => {
      delete c.indexes;
    });

    await reset();
    const s1 = await getSchema();
    assert.deepEqual(s1, emptySchema);

    await apply(schema, { ignoreIndexes: true });
    const s2 = await getSchema();
    assert.deepEqual(s2, expectedSchema);
  });
  describe('with circular pointers', () => {
    const circularSchema = {
      collections: [
        {
          className: 'Foo',
          fields: {
            objectId: {
              type: 'String'
            },
            createdAt: {
              type: 'Date'
            },
            updatedAt: {
              type: 'Date'
            },
            ACL: {
              type: 'ACL'
            },
            barPointer: {
              type: 'Pointer',
              targetClass: 'Bar'
            }
          },
          classLevelPermissions: {
            find: {},
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
            objectId: {
              type: 'String'
            },
            createdAt: {
              type: 'Date'
            },
            updatedAt: {
              type: 'Date'
            },
            ACL: {
              type: 'ACL'
            },
            fooPointer: {
              type: 'Pointer',
              targetClass: 'Foo'
            }
          },
          classLevelPermissions: {
            find: {},
            get: {},
            create: {},
            update: {},
            delete: {},
            addField: {}
          }
        }
      ],
      functions: [],
      triggers: []
    };
    it('should be added correctly', async () => {

      await reset();
      const s1 = await getSchema();
      assert.deepEqual(s1, emptySchema);

      await apply(circularSchema);
      const s2 = await getSchema();
      assert.deepEqual(s2, circularSchema);
    });
  });
});
