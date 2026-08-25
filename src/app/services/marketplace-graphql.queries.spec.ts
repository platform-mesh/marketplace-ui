import {
  createAPIBindingMutation,
  deleteAPIBindingMutation,
  getMarketplaceEntriesQuery,
} from './marketplace-graphql.queries';
import { buildSchema, print, validate } from 'graphql';

interface NodeProcess {
  cwd(): string;
  getBuiltinModule(name: 'fs'): {
    readFileSync(path: string, encoding: 'utf8'): string;
  };
}

describe('getMarketplaceEntriesQuery', () => {
  it('requests the generic provider UI extension context', () => {
    const query = print(getMarketplaceEntriesQuery);

    expect(query).toContain('data');
    expect(query).toContain('documentation {');
    expect(query).toContain('displayName');
    expect(query).toContain('detailViewExtensions {');
    expect(query).toContain('url');
    expect(query).toContain('apiExportPermissionClaims {');
    expect(query).toContain('defaultSelector {');
    expect(query).toContain('matchExpressions {');
    expect(query).toContain('matchLabels');
    expect(query).toContain('verbs');
  });

  it('validates every marketplace operation against the generated schema', () => {
    const nodeProcess = (globalThis as unknown as { process: NodeProcess })
      .process;
    const schemaSDL = nodeProcess
      .getBuiltinModule('fs')
      .readFileSync(`${nodeProcess.cwd()}/schemas/schema.graphql`, 'utf8');
    const schema = buildSchema(schemaSDL);

    for (const operation of [
      createAPIBindingMutation,
      deleteAPIBindingMutation,
      getMarketplaceEntriesQuery,
    ]) {
      expect(validate(schema, operation)).toEqual([]);
    }
  });
});
