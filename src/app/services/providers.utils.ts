import { CardFilter, CatalogDataItem } from 'models/index';

export class ProvidersUtils {
  static getProviders = (data: CatalogDataItem[] = []) => {
    return Array.from(new Set(data.map((el) => el.type)))
      .filter((type): type is string => !!type)
      .sort((a, b) => a.localeCompare(b))
      .map((type) => ({ label: this.capitalize(type), id: type }));
  };

  static filterByProviders = (filter: CardFilter, el: CatalogDataItem) =>
    !filter.providers?.length ||
    filter.providers.some((providerFilter) => providerFilter.id === el.type);

  private static capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
}
