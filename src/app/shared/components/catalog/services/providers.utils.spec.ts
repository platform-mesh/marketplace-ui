import { ProvidersUtils } from './providers.utils';
import { VerificationType } from '@dxp/ngx-core/provider-verification';

describe('ProvidersUtils', () => {
  describe('getProviders', () => {
    const expectedProviders = [
      { id: 'hyperspace', label: 'Hyperspace' },
      { id: 'hyperspacePartner', label: 'Hyperspace Partner' },
      { id: 'community', label: 'Community' },
    ];
    it('should return expected providers', () => {
      const resultProviders = ProvidersUtils.getProviders();

      expect(resultProviders).toEqual(expectedProviders);
    });
  });
});

describe.each([
  {
    filter: {
      providers: [],
    },
    item: { verification: undefined },
    expected: true,
  },
  {
    filter: {
      providers: [],
    },
    item: { verification: { type: VerificationType.Hyperspace } },
    expected: true,
  },
  {
    filter: {
      providers: [{ label: 'Hyperspace', id: VerificationType.Hyperspace }],
    },
    item: { verification: { type: VerificationType.Hyperspace } },
    expected: true,
  },
  {
    filter: {
      providers: [
        { label: 'Hyperspace', id: VerificationType.Hyperspace },
        { label: 'Hyperspace', id: VerificationType.HyperspacePartner },
      ],
    },
    item: { verification: { type: VerificationType.Hyperspace } },
    expected: true,
  },
  {
    filter: {
      providers: [],
    },
    item: { verification: { type: VerificationType.Hyperspace } },
    expected: true,
  },
  {
    filter: {
      providers: [{ label: 'Hyperspace', id: VerificationType.Hyperspace }],
    },
    item: { verification: { type: VerificationType.HyperspacePartner } },
    expected: false,
  },
])('filterByProviders', ({ filter, item, expected }) => {
  it(`should return ${expected}, when provider filter is ${filter.providers}`, () => {
    const result = ProvidersUtils.filterByProviders(filter, item);

    expect(result).toEqual(expected);
  });
});
