import { CardFilter } from '../components/core-catalog/core-catalog.component';
import { CategoriesUtils } from './categories.utils';

describe('CategoriesUtils', () => {
  describe.each([
    {
      items: [{ category: 'A' }, { category: 'A' }],
      expected: ['All', 'A'],
    },
    {
      items: [{ category: 'B' }, { category: 'A' }, {}],
      expected: ['All', 'A', 'B'],
    },
    {
      items: [
        { category: 'C' },
        { category: 'A' },
        { category: 'B' },
        { category: 'A' },
        { category: 'A' },
        {},
      ],
      expected: ['All', 'A', 'B', 'C'],
    },
    {
      items: [],
      expected: ['All'],
    },
  ])('getCategories', ({ items, expected }) => {
    it(`should return ${expected.join(',')}`, () => {
      const resultCategories = CategoriesUtils.getCategories(items);

      expect(resultCategories).toEqual(expected);
    });
  });

  describe.each([
    {
      filter: { category: 'A' },
      item: { category: 'A' },
      expected: true,
    },
    {
      filter: { category: 'All' },
      item: { category: 'A' },
      expected: true,
    },
    {
      filter: { category: 'B' },
      item: { category: 'A' },
      expected: false,
    },
  ])('filterByCategory', ({ filter, item, expected }) => {
    it(`should return ${expected}, when category filter is ${filter.category}`, () => {
      const isFiltered = CategoriesUtils.filterByCategory(
        filter as CardFilter,
        item,
      );

      expect(isFiltered).toEqual(expected);
    });
  });
});
