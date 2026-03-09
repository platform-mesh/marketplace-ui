import { print } from 'graphql';
import { createAPIBindingMutation } from './marketplace-graphql.queries';

describe('createAPIBindingMutation', () => {
  it('uses the unversioned permissionClaims input with the v1alpha2 mutation path', () => {
    const printed = print(createAPIBindingMutation);

    expect(printed).toContain(
      '$permissionClaims: [APIBindingspecspecpermissionClaimsInput]',
    );
    expect(printed).toContain('apis_kcp_io');
    expect(printed).toContain('v1alpha2');
    expect(printed).toContain('createAPIBinding');
  });
});
