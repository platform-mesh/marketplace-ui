import { luigiContextUpdate } from './luigi-context-update.action';
import { luigiContextReducer } from './luigi-context.reducer';
import { DxpContext } from '@dxp/ngx-core/common';

describe('LuigiContextReducer', () => {
  let initialState: DxpContext | undefined;

  beforeEach(() => {
    initialState = undefined;
  });

  it('should set the context when the luigi context updates', () => {
    const newContext = {
      frameContext: {},
      tenantid: 'new',
      token: '123',
      userid: 'user',
    } as DxpContext;
    const action = luigiContextUpdate({ luigiContext: newContext });

    const state = luigiContextReducer(initialState, action);

    expect(state).toEqual(newContext);
  });
});
