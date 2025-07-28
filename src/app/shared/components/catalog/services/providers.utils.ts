import { CardFilter } from '../components/core-catalog/core-catalog.component';
import { CatalogDataItem } from '../models';
import { VerificationType } from 'models/verification-type';

export class ProvidersUtils {
  static providerFallbackId = 'community';
  static getProviders = () => [
    { label: 'Hyperspace', id: VerificationType.Hyperspace },
    { label: 'Hyperspace Partner', id: VerificationType.HyperspacePartner },
    { label: 'Community', id: this.providerFallbackId },
  ];

  static isCommunityVerification = (providerId: string, el: CatalogDataItem) =>
    providerId === this.providerFallbackId &&
    el.verification?.type !== VerificationType.Hyperspace &&
    el.verification?.type !== VerificationType.HyperspacePartner;

  static filterByProviders = (filter: CardFilter, el: CatalogDataItem) =>
    !filter.providers?.length ||
    filter.providers.some(
      (providerFilter) =>
        providerFilter.id === el.verification?.type ||
        this.isCommunityVerification(providerFilter.id, el),
    );
}
