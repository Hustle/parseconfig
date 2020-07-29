"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


const voidLogger = {
  info: () => {},
  error: () => {},
  warn: () => {}
};

const consoleLogger = {
  info: (...args) => console.error(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.error(...args)
};

exports.voidLogger = voidLogger;
exports.consoleLogger = consoleLogger;