// @flow

export type Logger = {
  info: (...any) => void,
  error: (...any) => void,
  warn: (...any) => void
};

const voidLogger: Logger = {
  info: () => {},
  error: () => {},
  warn: () => {}
};

const consoleLogger: Logger = {
  info: (...args) => console.error(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.error(...args)
};

export {
  voidLogger,
  consoleLogger,
}
