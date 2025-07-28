export class RemoveAccountConfirmationComponentPo {
  constructor(private root: HTMLElement) {}

  get defaultText(): HTMLElement | null {
    return this.root.querySelector('fd-message-box-body');
  }

  get confirmationInput(): HTMLInputElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-remove-dialog-input"]',
    );
  }

  get removeButton(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-remove-dialog-button"]',
    );
  }

  get cancelButton(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-account-remove-dialog-cancel-button"]',
    );
  }

  get defaultAccountLabel(): HTMLElement | null {
    return this.root.querySelector('label[fd-form-label]');
  }

  clickRemoveButton(): void {
    this.removeButton?.dispatchEvent(new Event('click'));
  }

  clickCancelButton(): void {
    this.cancelButton?.dispatchEvent(new Event('click'));
  }

  enterConfirmationText(text: string): void {
    const input = this.confirmationInput;
    if (input) {
      input.value = text;
      input.dispatchEvent(new Event('input'));
    }
  }

  getTextContent(element: HTMLElement | null): string {
    return element?.textContent?.trim() || '';
  }
}
