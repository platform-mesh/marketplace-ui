import { CardFilter, CatalogDataItem } from '../models';
import { ProvidersUtils } from './providers.utils';

describe('ProvidersUtils', () => {
  describe('getProviders', () => {
    it('should return an empty list when there is no data', () => {
      expect(ProvidersUtils.getProviders()).toEqual([]);
    });

    it('should derive unique, sorted and capitalized provider options from the data types', () => {
      const data = [
        { type: 'managed' },
        { type: 'composition' },
        { type: 'managed' },
        { type: undefined },
      ] as CatalogDataItem[];

      expect(ProvidersUtils.getProviders(data)).toEqual([
        { label: 'Composition', id: 'composition' },
        { label: 'Managed', id: 'managed' },
      ]);
    });
  });

  describe('filterByProviders', () => {
    it.each([
      {
        description: 'no providers filter — should always include',
        filter: { providers: [] },
        item: { type: undefined },
        expected: true,
      },
      {
        description: 'matching type — should include',
        filter: { providers: [{ label: 'Composition', id: 'composition' }] },
        item: { type: 'composition' },
        expected: true,
      },
      {
        description: 'non-matching filter — should exclude',
        filter: { providers: [{ label: 'Managed', id: 'managed' }] },
        item: { type: 'composition' },
        expected: false,
      },
      {
        description: 'item without a type — should exclude when a filter is set',
        filter: { providers: [{ label: 'Managed', id: 'managed' }] },
        item: { type: undefined },
        expected: false,
      },
      {
        description:
          'multiple providers filter with one matching — should include',
        filter: {
          providers: [
            { label: 'Managed', id: 'managed' },
            { label: 'Composition', id: 'composition' },
          ],
        },
        item: { type: 'composition' },
        expected: true,
      },
    ])('$description', ({ filter, item, expected }) => {
      const result = ProvidersUtils.filterByProviders(
        filter as CardFilter,
        item as CatalogDataItem,
      );
      expect(result).toBe(expected);
    });
  });
});
