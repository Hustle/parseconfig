import { getPlan, execute, getLiveSchema } from '../dist/actions';
import { voidLogger } from '../dist/logger';

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

const apply =  async (newSchema, opts = {}) => {
  const logger = opts.logger || voidLogger
  const planOpts = Object.assign({}, options, opts);
  const gamePlan = await getPlan(newSchema, parseUrl, planOpts, logger);
  if (opts.logPlan) {
    console.log(gamePlan);
  }
  return execute(
    gamePlan,
    parseUrl,
    options.applicationId,
    options.key,
    logger
  );
};

const getSchema = async () => getLiveSchema(
  parseUrl,
  options.applicationId,
  options.key
);

const reset = async () => apply(emptySchema);

export {
  reset,
  getSchema,
  apply,
  emptySchema,
}
