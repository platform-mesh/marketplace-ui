import { MarketplaceEntry, ServiceInstanceStatusValue } from 'models/index';

export function getExtensionClassStatusValue(
  e: MarketplaceEntry,
): ServiceInstanceStatusValue | undefined {
  if (!e?.spec.installed) {
    return undefined;
  }

  return undefined;
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
