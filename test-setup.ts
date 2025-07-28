// sort-imports-ignore
import '@angular/localize/init';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TextDecoder, TextEncoder } from 'util';

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

global.TextEncoder = TextEncoder;
// @ts-expect-error incompatibility with Node.js
global.TextDecoder = TextDecoder;

const consoleError = console.error;
console.error = function (error: unknown, ...errorData: unknown[]) {
  if (error?.toString().includes('Could not parse CSS stylesheet')) {
    return;
  }

  consoleError(error, errorData);
  throw 'a console error occurred';
};
