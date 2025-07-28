import { hasPolicy, selectScope, selectScopeInfo } from './luigi.selectors';
import { NodeContext } from 'models/index';

describe('LuigiSelectors', () => {
  it('should return undefined if the luigi context is empty', () => {
    const result = selectScopeInfo.projector(
      undefined as unknown as NodeContext,
    );

    expect(result).toEqual(undefined);
  });

  it('should return the project scope info', () => {
    const ctx = {
      parentNavigationContexts: ['project'],
      projectId: 'abc',
    } as unknown as NodeContext;
    const result = selectScopeInfo.projector(ctx);
    const scopeResult = result ? selectScope.projector(result) : undefined;

    expect(result).toEqual({
      scopeId: 'abc',
      scopeType: 'PROJECT',
    });
    expect(scopeResult).toEqual('PROJECT');
  });

  it('should return the team scope info', () => {
    const ctx = {
      parentNavigationContexts: ['team'],
      teamId: 'abc',
    } as unknown as NodeContext;
    const result = selectScopeInfo.projector(ctx);
    const scopeResult = result ? selectScope.projector(result) : undefined;

    expect(result).toEqual({ scopeId: 'abc', scopeType: 'TEAM' });
    expect(scopeResult).toEqual('TEAM');
  });

  it('should return the tenant scope info', () => {
    const ctx = {
      parentNavigationContexts: ['tenant'],
      tenantid: 'abc',
    } as unknown as NodeContext;
    const result = selectScopeInfo.projector(ctx);
    const scopeResult = result ? selectScope.projector(result) : undefined;

    expect(result).toEqual({
      scopeId: 'abc',
      scopeType: 'TENANT',
    });
    expect(scopeResult).toEqual('TENANT');
  });

  it('should get the hasPolicy', () => {
    const ctx = {
      parentNavigationContexts: ['tenant'],
      tenantid: 'abc',
    } as unknown as NodeContext;
    const result = selectScopeInfo.projector(ctx);
    const scopeResult = result ? selectScope.projector(result) : undefined;

    expect(result).toEqual({
      scopeId: 'abc',
      scopeType: 'TENANT',
    });
    expect(scopeResult).toEqual('TENANT');
  });

  describe('hasPolicy', () => {
    const cases = [
      [
        'should return true if teamId is present and the policy exists in team policies',
        {
          teamId: 'my-team',
          entityContext: {
            team: {
              policies: ['iamOwner', 'policy2'],
            },
          },
        },
        'iamOwner',
        true,
      ],
      [
        'should return false if teamId is present but the policy does not exist in team policies',
        {
          teamId: 'my-team',
          entityContext: {
            team: {
              policies: ['policy1', 'policy2'],
            },
          },
        },
        'iamOwner',
        false,
      ],
      [
        'should return true if projectId is present and the policy exists in project policies',
        {
          projectId: 'my-project',
          entityContext: {
            project: {
              policies: ['iamAdmin', 'policyX'],
            },
          },
        },
        'iamAdmin',
        true,
      ],
      [
        'should return false if projectId is present but the policy does not exist in project policies',
        {
          projectId: 'my-project',
          entityContext: {
            project: {
              policies: ['policyA', 'policyB'],
            },
          },
        },
        'iamOwner',
        false,
      ],
      [
        'should return false if neither teamId nor projectId is present',
        {
          entityContext: {
            team: {},
            project: {},
          },
        },
        'iamOwner',
        false,
      ],
    ];

    cases.forEach(([description, mockContext, policy, expected]) => {
      // eslint-disable-next-line jest/valid-title
      it(description as string, () => {
        const scopeResult = hasPolicy(policy as string).projector(
          mockContext as unknown as NodeContext,
        );

        expect(scopeResult).toBe(expected);
      });
    });
  });
});
