export class ExtensionAccountResourcesComponentPo {
  constructor(private root: HTMLElement) {}

  get tableTitle(): HTMLElement | null {
    return this.root.querySelector('[fd-title]');
  }

  get globalAddButton(): HTMLButtonElement | null {
    return this.root.querySelector('[fd-toolbar-item]');
  }

  get tableRows(): NodeListOf<HTMLTableRowElement> {
    return this.root.querySelectorAll<HTMLTableRowElement>(
      'fdp-table tbody tr',
    );
  }

  get tableHeaders(): NodeListOf<HTMLTableSectionElement> {
    return this.root.querySelectorAll<HTMLTableSectionElement>(
      '[role="columnheader"]',
    );
  }
  get editAction(): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      '[data-testid="dxp-table-generator-edit-button"]',
    );
  }

  get deleteAction(): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      '[data-testid="dxp-table-generator-delete-button"]',
    );
  }

  get figure(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('.fd-illustrated-message');
  }

  get title(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(
      '.fd-illustrated-message__title',
    );
  }

  get description(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(
      '.fd-illustrated-message__text',
    );
  }

  get figureAddButton(): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      '[data-testid="app-provider-accounts-add-button"]',
    );
  }

  getTableData(name: string): HTMLElement[] {
    return Array.from(this.tableRows)
      .map((row) => row.querySelector<HTMLElement>(`.fdp-table__col--${name}`))
      .filter((cell): cell is HTMLElement => cell !== null);
  }

  getTextContent(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }
}
