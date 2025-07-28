export class EditAccountComponentPo {
  constructor(private root: HTMLElement) {}

  get pageTitle(): HTMLElement | null {
    return this.root.querySelector('fd-message-box-header h1');
  }

  get avatar(): HTMLElement | null {
    return this.root.querySelector('.list-item fd-avatar');
  }

  get displayName(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-edit-dialog-displayName"]',
    );
  }

  get accountSubType(): HTMLElement | null {
    return this.root.querySelector('[fd-list-byline]');
  }

  get setDefaultCheckbox(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-edit-dialog-set-as-default-checkbox"]',
    );
  }

  get overrideDefaultLabel(): HTMLElement | null {
    return this.root.querySelector('[fd-form-label]');
  }

  get saveButton(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-edit-dialog-button"]',
    );
  }

  get cancelButton(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-cancel-edit-dialog-button"]',
    );
  }

  toggleSetDefaultCheckbox(): void {
    this.setDefaultCheckbox?.dispatchEvent(new Event('click'));
  }

  clickSaveButton(): void {
    this.saveButton?.dispatchEvent(new Event('click'));
  }

  clickCancelButton(): void {
    this.cancelButton?.dispatchEvent(new Event('click'));
  }

  getTextContent(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }
}
