import { createSelector } from '@ngrx/store';
import { NodeContext } from 'models/index';
import { luigiContextSelector } from 'services/luigi/state';
import { getEntityScopeFromContext } from 'shared/utils/entity-context.util';

export interface ScopeInformation {
  scopeId?: string;
  scopeType: string;
}

export const selectScopeInfo = createSelector(
  luigiContextSelector,
  (nodeContext): ScopeInformation | undefined => {
    if (!nodeContext) {
      return undefined;
    }
    const entityScope = getEntityScopeFromContext(nodeContext);

    if (entityScope?.entityId && entityScope?.entityType) {
      return {
        scopeId: entityScope.entityId,
        scopeType: entityScope.entityType.toUpperCase(),
      };
    } else {
      return {
        scopeId: nodeContext.tenantId || nodeContext.organizationId,
        scopeType: 'TENANT',
      };
    }
  },
);

export const selectScope = createSelector(
  selectScopeInfo,
  (scopeInformation: ScopeInformation | undefined) =>
    !scopeInformation ? '' : scopeInformation.scopeType,
);

export const hasPolicy = (policy: string) =>
  // @ts-ignore
  createSelector(luigiContextSelector, (ctx: NodeContext) => {
    const entityScope = getEntityScopeFromContext(ctx);

    return (entityScope?.entityPolicies || []).includes(policy);
  });
