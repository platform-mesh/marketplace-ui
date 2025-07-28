import { CatalogDataItem } from '../../models';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import { FdpSelectionChangeEvent } from '@fundamental-ngx/platform';
import { VerificationType } from 'models/index';

export class CatalogPagePo {
  constructor(private root: HTMLElement) {}

  get headerTitle(): HTMLElement {
    return this.root.querySelector('.header')!;
  }

  get description(): HTMLElement | null {
    return this.root.querySelector('fd-layout-panel-description');
  }

  get categoryFilter(): HTMLElement | null {
    return this.root.querySelector('.catalog-page-header-filter fdp-select');
  }

  get providerFilter(): HTMLElement | null {
    return this.root.querySelector(
      '.catalog-page-header-filter fdp-multi-combobox',
    );
  }

  get searchField(): HTMLElement | null {
    return this.root.querySelector('fdp-search-field');
  }

  get catalogItems(): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll(
      '.catalog-page .layout-grid-item app-catalog-item .fd-card__title--clamp',
    );
  }

  get emptyCatalogMessage(): HTMLElement | null {
    return this.root.querySelector('app-empty-catalog h3');
  }

  selectCategoryFilter(): void {
    this.categoryFilter?.dispatchEvent(
      new CustomEvent<FdpSelectionChangeEvent>('selectionChange', {
        bubbles: true,
      }),
    );
  }

  selectProviderFilter(): void {
    this.providerFilter?.dispatchEvent(
      new CustomEvent<MultiComboboxSelectionChangeEvent>('selectionChange', {
        bubbles: true,
      }),
    );
  }

  submitSearch(): void {
    this.searchField?.dispatchEvent(
      new Event('searchSubmit', { bubbles: true }),
    );
  }

  clickCatalogItem(index: number): void {
    this.catalogItems[index].dispatchEvent(
      new Event('click', { bubbles: true }),
    );
  }

  getMockDataItems(): CatalogDataItem[] {
    return [
      {
        title: 'Test Extension',
        badge: { text: 'Installed', color: '2' },
        testId: 'catalog-item-1',
        description: 'extension for testing.',
        image: 'https://via.placeholder.com/150',
        provider: 'HS',
        labels: [
          { title: 'Recommended', glyph: 'star', color: '1' },
          { title: 'NEW', glyph: 'sun', color: '2' },
        ],
        category: 'HS',
        additionalInfo: [{ label: 'Version', value: '1.0.0' }],
        verification: {
          type: VerificationType.HyperspacePartner,
        },
      },
      {
        title: 'Test Extension 2',
        testId: 'catalog-item-2',
        description: 'extension for testing.',
        image: 'https://via.placeholder.com/150',
        labels: [{ title: 'NEW', glyph: 'sun', color: '2' }],
        category: 'HS2',
        provider: 'HS',
        verification: {
          type: VerificationType.Hyperspace,
        },
      },
    ];
  }

  // TODO move this to a more generic place
  getTextContent(element: HTMLElement | null): string {
    return element?.textContent?.trim() || '';
  }
}
