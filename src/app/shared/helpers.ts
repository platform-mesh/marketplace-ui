import {
  ProviderMetadata,
  ScopeType,
  ServiceInstance,
  ServiceInstanceStatusValue,
} from 'models/index';

export function getExtensionClassStatusValue(
  e: ProviderMetadata,
): ServiceInstanceStatusValue | undefined {
  if (!e?.instance) {
    return undefined;
  }

  return getExtensionInstanceStatusValue(e.instance);
}

export function getExtensionInstanceStatusValue(
  e: ServiceInstance,
): ServiceInstanceStatusValue | undefined {
  if (!e.serviceInstanceStatus) {
    return undefined;
  }

  const status = Object.values(e.serviceInstanceStatus);
  if (status.length === 0) {
    return undefined;
  }

  return status[0];
}

export function parseScopeType(scope: string): ScopeType | undefined {
  switch (scope.toUpperCase()) {
    case 'PROJECT':
      return ScopeType.PROJECT;
    case 'TEAM':
      return ScopeType.TEAM;
    case 'COMPONENT':
      return ScopeType.COMPONENT;
    case 'TENANT':
      return ScopeType.TENANT;
    case 'GLOBAL':
      return ScopeType.GLOBAL;
    default:
      return undefined;
  }
}
export function getInstallableScope(scope: ScopeType | string): ScopeType[] {
  if ((scope as ScopeType) === ScopeType.TENANT) {
    return [ScopeType.TENANT, ScopeType.PROJECT, ScopeType.TEAM];
  }
  return [scope as ScopeType];
}

export function parseNestedFields(field: string): string {
  if (!field.includes('.')) return field;

  const dotIndex = field.indexOf('.');
  const firstField = field.slice(0, dotIndex);
  const restFields = field.slice(dotIndex + 1);
  return `${firstField} { ${parseNestedFields(restFields)} }`;
}

export function prettifyErrorMessage(error: string): string {
  const regex = /^admission webhook ".*?" denied the request: (.*)/;
  const matchArr = error?.match(regex);
  return matchArr ? matchArr[matchArr.length - 1] : error;
}

export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

export function triggerMatomoEvent(
  eventName: string,
  parameters?: Record<string, string | undefined>,
) {
  window._mtm?.push({
    event: eventName,
    ...parameters,
  });
}

type Path = string | string[];

export function set<T extends object>(obj: T, path: Path, value: unknown): T {
  const pathArray = Array.isArray(path)
    ? path.map(String)
    : path.match(/([^[.\]])+/g) || [];

  pathArray.reduce(
    (acc: Record<string, unknown>, key: string, i: number) => {
      if (i === pathArray.length - 1) {
        acc[key] = value;
      } else {
        const nextKey = pathArray[i + 1];
        const shouldBeArray = /^\d+$/.test(nextKey);
        if (acc[key] === undefined) {
          acc[key] = shouldBeArray ? [] : {};
        }
      }
      return acc[key] as Record<string, unknown>;
    },
    obj as unknown as Record<string, unknown>,
  );

  return obj;
}
