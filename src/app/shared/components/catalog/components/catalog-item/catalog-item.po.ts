import { CatalogDataItem } from '../../models';
import { VerificationType } from 'models/verification-type';

export class CatalogItemComponentPo {
  constructor(private root: HTMLElement) {}

  get cardTitle(): HTMLElement {
    return this.root.querySelector('.fd-card__title')!;
  }

  get cardDescription(): HTMLElement {
    return this.root.querySelector('.fd-card__description--clamp')!;
  }

  get badge(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(
      '.fd-card__badge-container .fd-object-status',
    );
  }

  get infoLabels(): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll<HTMLElement>('.fd-card__label');
  }

  get avatar(): HTMLElement {
    return this.root.querySelector<HTMLElement>('fd-avatar')!;
  }

  get additionalInfo(): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll<HTMLElement>('.fd-card__content-group');
  }

  get providerVerification(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('app-provider-verification');
  }

  getAdditionalInfoText(): { label: string; value: string }[] {
    return Array.from(this.additionalInfo).map((infoGroup) => {
      const label = infoGroup.querySelector<HTMLLabelElement>('label')!;
      const value = infoGroup.querySelector<HTMLElement>('fd-text')!;
      return {
        label: this.getTextContent(label),
        value: this.getTextContent(value),
      };
    });
  }

  getMockDataItem(): CatalogDataItem {
    return {
      ...this.getLimitedMockDataItem(),
      description: 'extension for testing.',
      image: 'https://via.placeholder.com/150',
      labels: [
        { title: 'Recommended', glyph: 'star', color: '1' },
        { title: 'NEW', glyph: 'sun', color: '2' },
      ],
      additionalInfo: [{ label: 'Version', value: '1.0.0' }],
      verification: {
        type: VerificationType.HyperspacePartner,
      },
    };
  }

  getLimitedMockDataItem(): CatalogDataItem {
    return {
      title: 'Test Extension',
      badge: { text: 'Installed', color: '2' },
      testId: 'catalog-item-1',
    };
  }

  // TODO move this to a more generic place
  getTextContent(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }
}
