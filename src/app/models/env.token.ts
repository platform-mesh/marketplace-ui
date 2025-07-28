import { NodeContext } from './node-context';
import { InjectionToken } from '@angular/core';

export const ENV = new InjectionToken<Environment>('ENV');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Environment extends Record<string, any> {
  luigiContextOverwrite?: Partial<NodeContext>;
}
