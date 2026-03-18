import { ScopeType, ServiceStatus } from 'models/provider-metadata';
import {
  capitalize,
  getExtensionClassStatusValue,
  getInstallableScope,
  parseNestedFields,
  parseScopeType,
  prettifyErrorMessage,
  set,
} from 'shared/helpers';

describe('getExtensionClassStatusValue', () => {
  it('should return undefined if extension instances is empty', () => {
    expect(
      getExtensionClassStatusValue({
        name: 'Test Extension',
        instance: null,
        displayName: 'Test Extension',
        description: 'Test Description',
        scope: {
          type: ScopeType.TENANT,
        },
        configurationMetadata: '',
        isChangingInstallations: false,
      }),
    ).toBeUndefined();
  });

  it('should return extension instance status value if extension instances are valid', () => {
    expect(
      getExtensionClassStatusValue({
        name: 'Test Extension',
        instance: {
          id: '1',
          name: 'Test Instance',
          providerMetadata: {
            scope: { type: ScopeType.TENANT },
            name: '',
            displayName: '',
            configurationMetadata: '',
            instance: null,
            isChangingInstallations: false,
          },
          configurationMetadata: {},
          installationData: {},
          providerData: {},
          isMandatory: false,
          creationTimestamp: new Date(),
          status: ServiceStatus.READY,
          scope: { type: ScopeType.TENANT },
          serviceInstanceStatus: { statusKey: { label: 'Ready' } },
        },
        displayName: 'Test Extension',
        description: 'Test Description',
        scope: {
          type: ScopeType.TENANT,
        },
        configurationMetadata: '',
        isChangingInstallations: false,
      }),
    ).toEqual({ label: 'Ready' });
  });

  it('should return undefined for invalid extensionStatus', () => {
    expect(
      getExtensionClassStatusValue({
        name: 'Test Extension',
        instance: {
          id: '1',
          name: 'Test Instance',
          providerMetadata: {
            scope: { type: ScopeType.TENANT },
            name: '',
            displayName: '',
            configurationMetadata: '',
            instance: null,
            isChangingInstallations: false,
          },
          configurationMetadata: {},
          installationData: {},
          providerData: {},
          isMandatory: false,
          creationTimestamp: new Date(),
          status: ServiceStatus.READY,
          scope: { type: ScopeType.TENANT },
          serviceInstanceStatus: undefined,
        },
        displayName: 'Test Extension',
        description: 'Test Description',
        scope: {
          type: ScopeType.TENANT,
        },
        configurationMetadata: '',
        isChangingInstallations: false,
      }),
    ).toBeUndefined();
  });
});

describe('when getInstallableScope', () => {
  describe('and the scope of the extension details component is tenant (example the catalog page)', () => {
    it('should return installable scope having tenant, project and team so we show all extensions and not only tenant level ones', () => {
      expect(getInstallableScope(ScopeType.TENANT)).toEqual([
        ScopeType.TENANT,
        ScopeType.PROJECT,
        ScopeType.TEAM,
      ]);
    });
  });

  describe('and the scope of the extension details component', () => {
    const scopes: ScopeType[] = [ScopeType.PROJECT, ScopeType.TEAM];

    scopes.forEach((scope) => {
      it('and the scope of the extension details component is %s, it should return the same scope', () => {
        const result = getInstallableScope(scope);
        expect(result).toEqual([scope]);
      });
    });
  });

  describe('parseNestedFields', () => {
    it('should return undefined for fields without dots', () => {
      expect(parseNestedFields('field')).toBe('field');
    });

    it('should parse single nested field correctly', () => {
      expect(parseNestedFields('field.subfield')).toBe('field { subfield }');
    });

    it('should parse multiple nested fields correctly', () => {
      expect(parseNestedFields('field.subfield.subsubfield')).toBe(
        'field { subfield { subsubfield } }',
      );
    });

    it('should handle empty string input', () => {
      expect(parseNestedFields('')).toBe('');
    });
  });
  describe('prettifyErrorMessage', () => {
    it('should return the error message without the prefix when it matches the pattern', () => {
      const error =
        'admission webhook "vjenx.kb.io" denied the request: some error message';
      const result = prettifyErrorMessage(error);
      expect(result).toBe('some error message');
    });

    it('should return the error message without the prefix when it matches another webhook pattern', () => {
      const error =
        'admission webhook "jira.kb.io" denied the request: some error message';
      const result = prettifyErrorMessage(error);
      expect(result).toBe('some error message');
    });

    it('should return the original error message when it does not match the pattern', () => {
      const error = 'some other error message';
      const result = prettifyErrorMessage(error);
      expect(result).toBe(error);
    });

    it('should return the original error message when it is an empty string', () => {
      const error = '';
      const result = prettifyErrorMessage(error);
      expect(result).toBe(error);
    });

    it('should return the original error message when it does not contain the expected format', () => {
      const error = 'admission webhook denied the request: some error message';
      const result = prettifyErrorMessage(error);
      expect(result).toBe(error);
    });
  });
  describe('capitalize', () => {
    it('should capitalize the first letter and lowercase the rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('tEsT')).toBe('Test');
    });

    it('should handle single-letter strings', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('Z')).toBe('Z');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle strings with spaces', () => {
      expect(capitalize(' hello')).toBe(' hello'); // Leading space remains unchanged
      expect(capitalize('hello world')).toBe('Hello world'); // Only first word is affected
    });

    it('should handle strings with special characters', () => {
      expect(capitalize('123abc')).toBe('123abc'); // Numbers are unchanged
      expect(capitalize('@test')).toBe('@test'); // Special characters remain unchanged
    });
  });

  describe('set', () => {
    it('sets a top-level property', () => {
      const result: Record<string, object> = {};
      const path = 'name';
      const value = 'TestName';

      const newRes = set(result, path, value);
      const expectedResult = {
        name: 'TestName',
      };
      expect(set(newRes, path, value)).toStrictEqual(expectedResult);
    });

    it('sets a nested property using array path', () => {
      const obj = {};
      set(obj, ['user', 'metadata', 'name'], 'TestName');
      expect(obj).toEqual({
        user: {
          metadata: {
            name: 'TestName',
          },
        },
      });
    });

    it('sets a value inside an array', () => {
      const obj = {};
      set(obj, 'items[0].name', 'Item 1');
      expect(obj).toEqual({
        items: [{ name: 'Item 1' }],
      });
    });

    it('sets a deeply nested value with array indices', () => {
      const obj = {};
      set(obj, 'a.b[0].c.d[2].e', 'deep');
      expect(obj).toEqual({
        a: {
          b: [
            {
              c: {
                d: [
                  undefined,
                  undefined,
                  {
                    e: 'deep',
                  },
                ],
              },
            },
          ],
        },
      });
    });

    it('overwrites an existing value', () => {
      const obj = { foo: { bar: 1 } };
      set(obj, 'foo.bar', 42);
      expect(obj).toEqual({ foo: { bar: 42 } });
    });

    it('sets nested values', () => {
      const result: Record<string, object> = {};
      const path = 'metadata.name.dummyval.firstName';
      const value = 'TestName';

      const newRes = set(result, path, value);
      const expectedResult = {
        metadata: {
          name: {
            dummyval: {
              firstName: 'TestName',
            },
          },
        },
      };
      expect(set(newRes, path, value)).toStrictEqual(expectedResult);
    });
  });

  it('handles empty string path', () => {
    const obj = {};
    set(obj, '', 'oops');
    expect(obj).toEqual({});
  });
});

describe('parseScopeType', () => {
  it('should return ScopeType.PROJECT for "PROJECT"', () => {
    expect(parseScopeType('PROJECT')).toBe(ScopeType.PROJECT);
  });

  it('should return ScopeType.TEAM for "TEAM"', () => {
    expect(parseScopeType('TEAM')).toBe(ScopeType.TEAM);
  });

  it('should return ScopeType.COMPONENT for "COMPONENT"', () => {
    expect(parseScopeType('COMPONENT')).toBe(ScopeType.COMPONENT);
  });

  it('should return ScopeType.TENANT for "TENANT"', () => {
    expect(parseScopeType('TENANT')).toBe(ScopeType.TENANT);
  });

  it('should return ScopeType.GLOBAL for "GLOBAL"', () => {
    expect(parseScopeType('GLOBAL')).toBe(ScopeType.GLOBAL);
  });

  it('should return undefined for an invalid scope', () => {
    expect(parseScopeType('INVALID_SCOPE')).toBeUndefined();
  });
});
