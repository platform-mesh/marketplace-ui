import { CatalogDataItem, InfoLabels } from '../../models';
import {
  INSTALLED_BADGE_TEXT,
  getFilteredDataByInfoLabels,
  getFilteredDataBySearchTerm,
  getSortedDataByInstallStatus,
  getSortedDataByTitle,
  getSuggestions,
} from './core-catalog.component.service';

describe('CatalogComponentService', () => {
  describe('when getSortedDataByInstallStatus is called', () => {
    it('should sort "installed" items first', () => {
      const data: CatalogDataItem[] = [
        {
          title: 'Item 1',
          badge: {
            text: 'Beta',
            color: '',
          },
        },
        {
          title: 'Item 2',
          badge: {
            text: 'INSTALLED',
            color: '',
          },
        },
        {
          title: 'Item 3',
        },
        {
          title: 'Item 4',
          badge: {
            text: 'INSTALLED',
            color: '',
          },
        },
      ];

      const sortedData = getSortedDataByInstallStatus(data);

      expect(sortedData[0].badge?.text).toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[1].badge?.text).toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[2].badge?.text).not.toBe(INSTALLED_BADGE_TEXT);
      expect(sortedData[3].badge?.text).not.toBe(INSTALLED_BADGE_TEXT);
    });

    it('should handle an empty list', () => {
      const data: CatalogDataItem[] = [];

      const sortedData = getSortedDataByInstallStatus(data);

      expect(sortedData).toEqual([]);
    });

    it('should handle an array with no "installed" items', () => {
      const data: CatalogDataItem[] = [
        {
          badge: {
            text: '',
            color: '',
          },
        },
        {
          badge: {
            text: 'Not installed',
            color: '',
          },
        },
      ];

      const sortedData = getSortedDataByInstallStatus(data);

      expect(sortedData).toEqual(data);
    });
  });

  describe('when getSortedDataByTitle is called', () => {
    it('should sort the data alphabetically by title', () => {
      const cases: [CatalogDataItem[], CatalogDataItem[]][] = [
        [
          [{ title: 'b' }, { title: 'a' }, { title: 'd' }, { title: 'c' }],
          [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }],
        ],
        [
          [{ title: 'a' }, { title: undefined }, { title: '' }],
          [{ title: undefined }, { title: '' }, { title: 'a' }],
        ],
        [
          [
            { title: 'A' },
            { title: 'b' },
            { title: '1' },
            { title: 'B' },
            { title: 'a' },
          ],
          [
            { title: '1' },
            { title: 'a' },
            { title: 'A' },
            { title: 'b' },
            { title: 'B' },
          ],
        ],
      ];

      cases.forEach(([items, expectedSortedData]) => {
        const sortedData = getSortedDataByTitle(items);
        expect(sortedData).toEqual(expectedSortedData);
      });
    });

    it('should create correct suggestions', () => {
      const items = [
        {},
        { title: '' },
        { title: 'searched' },
        { title: 'searched' },
        { title: 'SeArChed' },
        { image: 'image' },
        { title: 'something else', image: 'searched' },
        {
          title: 'something else again',
          badge: { text: 'searched', color: 'test' },
          labels: [],
          additionalInfo: [],
        },
        {
          title: 'something else again',
          badge: { text: 'searched', color: 'test' },
          additionalInfo: [
            {
              label: 'some label',
              value: 'searched',
            },
            {
              label: 'other label',
              value: 'other label value',
            },
          ],
        },
      ];
      const expectedSuggestions = [
        { value: 'searched' },
        { value: 'SeArChed' },
        { value: 'something else' },
        { value: 'something else again' },
        { value: 'some label' },
        { value: 'other label' },
        { value: 'other label value' },
      ];

      const suggestions = getSuggestions(items);

      expect(suggestions).toEqual(expectedSuggestions);
    });
  });

  describe('when getFilteredDataBySearchTerm is called', () => {
    it('should filter correctly', () => {
      const data = [
        { title: 'searched' },
        { title: 'something else' },
        { title: 'something else again ' },
        {
          additionalInfo: [
            {
              label: 'some label',
              value: 'searched',
            },
          ],
        },
        { title: 'something else', provider: 'searched' },
        {
          title: 'something else',
          description: 'something else again',
        },
        {
          title: 'something else',
          description: 'searched this description',
        },
      ];
      const expectedFilteredData = [data[0], data[3], data[4], data[6]];

      const filteredData = getFilteredDataBySearchTerm(data, 'searched');

      expect(filteredData).toEqual(expectedFilteredData);
    });

    it('should filter on badge texts but not on images', () => {
      const data = [
        { title: 'searched' },
        { title: 'something else', image: 'searched' },
        {
          title: 'something else again ',
          badge: { text: 'searched', color: 'test' },
        },
        {
          additionalInfo: [
            {
              label: 'some label',
              value: 'searched',
            },
          ],
        },
      ];
      const expectedFilteredData = [data[0], data[2], data[3]];

      const filteredData = getFilteredDataBySearchTerm(data, 'searched');

      expect(filteredData).toEqual(expectedFilteredData);
    });
  });

  describe('when getFilteredDataByInfoLabels is called', () => {
    const hyperspaceExt = {
      title: 'hyperspace extension',
      additionalInfo: [
        {
          label: InfoLabels.Provider,
          value: 'provider-hyperspace',
        },
        {
          label: InfoLabels.Category,
          value: 'category-hyperspace',
        },
      ],
    };
    const dxpExtension = {
      title: 'dxp extension',
      additionalInfo: [
        {
          label: InfoLabels.Provider,
          value: 'provider-dxp',
        },
        {
          label: InfoLabels.Category,
          value: 'category-dxp',
        },
      ],
    };
    const dxpExtensionOtherCategory = {
      title: 'dxp extension',
      additionalInfo: [
        {
          label: InfoLabels.Provider,
          value: 'provider-dxp',
        },
        {
          label: InfoLabels.Category,
          value: 'category-dxp-other',
        },
      ],
    };
    const macarenaExtension = {
      title: 'macarena extension',
      additionalInfo: [
        {
          label: InfoLabels.Category,
          value: 'macarena-category',
        },
      ],
    };
    it('filter data when filtering by one provider', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter = {
        label: InfoLabels.Provider,
        values: ['provider-hyperspace'],
      };

      const filteredData = getFilteredDataByInfoLabels(items, [providerFilter]);

      expect(filteredData).toEqual([hyperspaceExt]);
    });

    it('filter data when filtering by multiple providers', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter = {
        label: InfoLabels.Provider,
        values: ['provider-hyperspace', 'provider-dxp'],
      };

      const filteredData = getFilteredDataByInfoLabels(items, [providerFilter]);

      expect(filteredData).toEqual([hyperspaceExt, dxpExtension]);
    });

    it('filter data when filtering by category', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const categoryFilter = {
        label: InfoLabels.Category,
        values: ['category-dxp'],
      };

      const filteredData = getFilteredDataByInfoLabels(items, [categoryFilter]);

      expect(filteredData).toEqual([dxpExtension]);
    });

    it('filter data return only one item if all filters match the same item', () => {
      const items = [
        hyperspaceExt,
        dxpExtension,
        macarenaExtension,
        dxpExtensionOtherCategory,
      ];
      const providerFilter = {
        label: InfoLabels.Provider,
        values: ['provider-dxp'],
      };
      const categoryFilter = {
        label: InfoLabels.Category,
        values: ['category-dxp', 'category-dxp-other'],
      };
      const filteredData = getFilteredDataByInfoLabels(items, [
        categoryFilter,
        providerFilter,
      ]);

      expect(filteredData).toEqual([dxpExtension, dxpExtensionOtherCategory]);
    });

    it('filter data returns empty if items do not match all filters', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter = {
        label: InfoLabels.Provider,
        values: ['provider-dxp'],
      };
      const categoryFilter = {
        label: InfoLabels.Category,
        values: ['category-hyperspace', 'macarena-category'],
      };
      const filteredData = getFilteredDataByInfoLabels(items, [
        categoryFilter,
        providerFilter,
      ]);

      expect(filteredData).toEqual([]);
    });

    it('returns same data if no filters are passed', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];

      const filteredData = getFilteredDataByInfoLabels(items, []);

      expect(filteredData).toEqual(items);
    });

    it('filter all when the filters do not match any catalog item', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const supermanProviderFilter = {
        label: InfoLabels.Provider,
        values: ['superman'],
      };

      const filteredData = getFilteredDataByInfoLabels(items, [
        supermanProviderFilter,
      ]);

      expect(filteredData).toEqual([]);
    });

    it('filters are case unsensitive', () => {
      const items = [hyperspaceExt, dxpExtension, macarenaExtension];
      const providerFilter = {
        label: InfoLabels.Provider,
        values: ['PrOvIdEr-HyPeRsPaCe'],
      };

      const filteredData = getFilteredDataByInfoLabels(items, [providerFilter]);

      expect(filteredData).toEqual([hyperspaceExt]);
    });
  });
});
