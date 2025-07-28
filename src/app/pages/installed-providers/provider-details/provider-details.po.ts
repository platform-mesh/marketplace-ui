export class ProviderDetailsComponentPo {
  constructor(private root: HTMLElement) {}

  get pageTitle(): HTMLElement | null {
    return this.root.querySelector('.fd-dynamic-page__title');
  }

  get pageSubtitle(): HTMLElement | null {
    return this.root.querySelector('.fd-dynamic-page__subtitle');
  }

  get editButton(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-edit-button"]',
    );
  }

  get avatar(): HTMLElement | null {
    return this.root.querySelector('#avatar fd-avatar');
  }

  get providerVerification(): HTMLElement | null {
    return this.root.querySelector(
      'app-provider-verification .verification-label',
    );
  }

  get createdOn(): HTMLElement | null {
    return this.root.querySelector(
      '[aria-label="created-on"] .fd-object-status__text',
    );
  }

  get status(): HTMLElement | null {
    return this.root.querySelector('.fd-object-status--critical');
  }

  get labels(): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll('.label-container .fd-info-label__text');
  }

  get serviceLevel(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-serviceLevel-status"]',
    );
  }

  get accountSection(): HTMLElement | null {
    return this.root.querySelector('app-provider-account-table ');
  }

  get descriptionDetails(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-description"]',
    );
  }

  get descriptionDetailsHeader(): HTMLElement | null {
    return this.descriptionDetails?.querySelector('.fd-title') ?? null;
  }

  get documentationLink(): HTMLElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-documentation"] a',
    );
  }

  get contactsSection(): NodeListOf<HTMLElement> | null {
    return this.root.querySelectorAll(
      '[data-testid="app-provider-details-contacts"] div:not(.page-section__title)',
    );
  }

  clickEditButton(): void {
    this.editButton?.click();
  }

  getContactLinks(): string[] {
    if (!this.contactsSection) {
      return [];
    }
    return Array.from(this.contactsSection).map((contact) => {
      const linkElement = contact.querySelector('a')!;
      return linkElement?.getAttribute('href') || '';
    });
  }

  getContactRoles(): string[] {
    if (!this.contactsSection) {
      return [];
    }
    return Array.from(this.contactsSection).map((contact) => {
      const roles = contact.querySelectorAll('.contact-role span');
      return Array.from(roles)
        .map((role) => this.getTextContent(role as HTMLElement))
        .join('');
    });
  }

  getTextContent(element: HTMLElement | null): string {
    return element?.textContent?.trim() || '';
  }
}
