import assert from 'assert';

import { getPlan, execute, getLiveSchema } from '../dist/actions';

const deepCopy = (any) => JSON.parse(JSON.stringify(any));

describe('verifier', function() {
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
        triggerName: 'beforeSave',
        url: '/foo/beforeSave'
      },
      {
        className: 'Bar',
        triggerName: 'afterSave',
        url: '/bar/afterSave'
      }
    ]
  };
  const emptySchema = {
    collections: [],
    functions: [],
    triggers: []
  };
  
  const parseUrl = 'http://localhost:7345/1';
  const options = {
    applicationId: 'the_application_id',
    key: 'the_master_key',
    hookUrl: null,
    skipIndexes: false
  }

  const apply =  async (newSchema) => {
    const gamePlan = await getPlan(newSchema, parseUrl, options);
    return execute(
      gamePlan,
      parseUrl,
      options.applicationId,
      options.key
    );
  };

  const getSchema = async () => getLiveSchema(
    parseUrl,
    options.applicationId,
    options.key
  );

  const reset = async () => apply(emptySchema);

  describe('class level permissions', () => {
    it('should be added correctly', async () => {
      const oldSchema = deepCopy(defaultSchema);
      const newSchema = deepCopy(defaultSchema);

      newSchema.collections[0].classLevelPermissions.create['role:user'] = true

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
  });
});
