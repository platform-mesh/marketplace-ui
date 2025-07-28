import {
  ProviderMetadata,
  ServiceInstance,
  ServiceLevel,
} from 'models/provider-metadata';

export class ProviderDetailDialogPo {
  constructor(private root: HTMLElement) {}

  get installedTag(): HTMLElement | null {
    return this.root.querySelector(
      '.fd-dynamic-page__title-content fd-info-label',
    );
  }

  get mainLinkButton(): HTMLButtonElement | null {
    return this.root.querySelector('button[aria-label="Open"]');
  }

  get installButton(): HTMLButtonElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-dialog-install-button"]',
    );
  }

  get uninstallButton(): HTMLButtonElement | null {
    return this.root.querySelector(
      '[data-testid="app-provider-details-dialog-uninstall-button"]',
    );
  }

  get infoLabels(): NodeListOf<HTMLElement> {
    return this.root.querySelectorAll('.info-label');
  }

  get communityLinks(): {
    label: NodeListOf<HTMLElement>;
    link: NodeListOf<HTMLElement>;
    href: NodeListOf<HTMLAnchorElement>;
  } {
    return {
      label: this.root.querySelectorAll(
        '[data-testid="app-provider-community-links"]',
      ),
      link: this.root.querySelectorAll('.community-links'),
      href: this.root.querySelectorAll('.community-links a'),
    };
  }

  get supportChannel(): {
    label: NodeListOf<HTMLElement>;
    link: NodeListOf<HTMLElement>;
    href: NodeListOf<HTMLAnchorElement>;
  } {
    return {
      label: this.root.querySelectorAll(
        '[data-testid="app-provider-issue-links"]',
      ),
      link: this.root.querySelectorAll('.support-links'),
      href: this.root.querySelectorAll('.support-links a'),
    };
  }

  get productOwners(): {
    label: NodeListOf<HTMLElement>;
    link: NodeListOf<HTMLElement>;
    href: NodeListOf<HTMLAnchorElement>;
  } {
    return {
      label: this.root.querySelectorAll(
        '[data-testid="app-provider-product-owners"]',
      ),
      link: this.root.querySelectorAll('.contacts-links'),
      href: this.root.querySelectorAll('.contacts-links a'),
    };
  }

  get serviceLevel(): HTMLElement | null {
    return this.root.querySelector('#service-level');
  }

  get messageStrip(): HTMLElement | null {
    return this.root.querySelector('.message-container fd-message-strip');
  }

  get messageStripLink(): HTMLAnchorElement | null {
    return this.root.querySelector('.message-container a');
  }

  clickMainLinkButton(): void {
    this.mainLinkButton?.click();
  }

  clickVisitLink(): void {
    this.messageStripLink?.click();
  }

  clickInstallButton(): void {
    this.installButton?.click();
  }

  clickUninstallButton(): void {
    this.uninstallButton?.click();
  }

  getTextContent(element: HTMLElement | null): string {
    return element?.textContent?.trim() || '';
  }

  getMockData(): ProviderMetadata {
    return {
      name: 'extensionClassName',
      displayName: 'extensionDisplayName',
      scope: { type: 'PROJECT' },
      instance: { id: 'id', name: 'instance name' } as ServiceInstance,
      labels: [{ title: 'Label1', color: '1' }],
      accountConnections: [],
      documentation: { url: 'https://docs.example.com' },
      serviceLevel: ServiceLevel.VeryHigh,
      mainLink: {
        displayName: 'Link',
        URL: 'https://openExtensions',
      },
      preferredSupportChannels: [{ URL: 'supportUrl', displayName: 'support' }],
      configurationMetadata: '',
      isChangingInstallations: false,
    } as unknown as ProviderMetadata;
  }
}
