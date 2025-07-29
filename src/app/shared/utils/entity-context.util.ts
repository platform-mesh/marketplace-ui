import { NodeContext } from 'models/index';

export interface EntityScope {
  entityType: string;
  entityId: string;
  entityPolicies: string[];
}

export function getEntityScopeFromContext(
  nodeContext: NodeContext | undefined,
): EntityScope {
  const entityContext = nodeContext?.entityContext || {};
  const [entityKey, entityValue] = Object.entries(entityContext)[0];

  return {
    entityType: entityKey,
    entityId: entityValue?.id,
    entityPolicies: entityValue?.policies,
  };
}
