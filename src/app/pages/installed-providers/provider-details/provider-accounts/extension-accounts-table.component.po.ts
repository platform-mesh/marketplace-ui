export class ExtensionAccountsTableComponentPo {
  constructor(private root: HTMLElement) {}

  get table(): HTMLElement | null {
    return this.root.querySelector('fdp-table');
  }

  get illustrationMessage(): HTMLElement | null {
    return this.root.querySelector('.fd-illustrated-message');
  }

  get tableTitle(): HTMLElement | null {
    return this.table?.querySelector('[fd-title]') ?? null;
  }

  getTextContent(element: HTMLElement | null): string {
    return element?.textContent?.trim() || '';
  }

  get tableColumns(): NodeListOf<HTMLTableCellElement> {
    return this.root.querySelectorAll<HTMLTableCellElement>(
      '[role="columnheader"]',
    );
  }

  get tableRows(): NodeListOf<HTMLTableRowElement> {
    return this.root.querySelectorAll<HTMLTableRowElement>(
      '[fd-table] tbody tr',
    );
  }

  get messageStrip(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>('.fd-message-strip');
  }

  get extensionAccountResourcesTable(): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(
      'app-provider-account-resources',
    );
  }

  getTableData(name: string): HTMLElement[] {
    return Array.from(this.tableRows)
      .map((row) => row.querySelector<HTMLElement>(`.fdp-table__col--${name}`))
      .filter((cell): cell is HTMLElement => cell !== null);
  }

  getEditAction(displayName: string): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      `[data-testid="app-provider-accounts-list-${displayName}-edit-button"]`,
    );
  }

  getDeleteAction(displayName: string): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      `[data-testid="app-provider-accounts-list-${displayName}-remove-button"]`,
    );
  }

  get globalAddButton(): HTMLButtonElement | null {
    return this.root.querySelector<HTMLButtonElement>(
      '[data-testid="app-provider-accounts-add-account-button"]',
    );
  }
}
