import { luigiContextSelector } from './luigi-context.selector';

describe('LuigiContextSelector', () => {
  it('should return the context from the state', () => {
    const expectedContext = {
      frameContext: {},
      tenantid: 'new',
      token: '123',
      userid: 'user',
    };
    const luigiContext = luigiContextSelector({
      luigi: { context: expectedContext },
    });

    expect(luigiContext).toEqual(expectedContext);
  });
});
