import { LuigiClient, PmLuigiContextService } from './luigi';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '@dxp/ngx-core/notification';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { ConfirmationDialogDecision } from 'models/dialog';
import { EXTENSION_INSTALLED } from 'models/luigi-go-back';
import { ProviderConfigurationData } from 'models/provider-configuration-data';
import {
  AccountConnection,
  ColorCategory,
  InstallProviderInput,
  Label,
  ProviderMetadata,
  ScopeType,
  ServiceInstance,
  ServiceLevel,
  ServiceStatus,
} from 'models/provider-metadata';
import { filter, take } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';
import { triggerMatomoEvent } from 'shared/helpers';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import { unInstallExtension } from 'state/changing-extensions.actions';
import { ScopeInformation, selectScopeInfo } from 'state/luigi.selectors';
import { loadProviders } from 'state/providers.actions';

export const NEW_LABEL: Label = {
  title: 'New',
  color: '6',
};

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly notificationService = inject(NotificationService);
  private readonly pmLuigiContextService = inject(PmLuigiContextService);

  public scopeInfo?: ScopeInformation;

  constructor(
    private store: Store,
    private luigiClient: LuigiClient,
    private graphqlService: GraphqlService,
    private accountNamingService: AccountNamingService,
  ) {
    const scopeInformationObservable = this.store.select<
      ScopeInformation | undefined
    >(selectScopeInfo);
    scopeInformationObservable.subscribe(
      (scopeInfo) => (this.scopeInfo = scopeInfo),
    );

    this.handleInstallProvider();

    this.pmLuigiContextService.contextObservable().subscribe((ctx) => {
      console.log(ctx);
    });
  }

  installExtension(
    extension: ProviderMetadata | undefined,
    installationData?: Record<string, unknown>,
  ) {
    if (!extension) {
      throw new Error('Extension is undefined');
    }
    const installExtensionInstanceInput: InstallProviderInput = {
      installationData,
      providerInput: {
        id: extension.name,
        scope: extension.scope.type,
      },
      displayName: extension.displayName,
    };

    return this.graphqlService.installExtension(installExtensionInstanceInput);
  }

  updateExtension(
    extension: ProviderMetadata,
    extensionInstance: ServiceInstance,
    installationData: Record<string, unknown>,
  ) {
    const updateExtensionInstanceInput = {
      installationData,
      instanceId: extensionInstance.id,
      providerInput: {
        id: extensionInstance.providerMetadata.name,
        scope: extension.scope.type,
      },
    };
    return this.graphqlService.updateExtensionInstance(
      updateExtensionInstanceInput,
    );
  }

  uninstallExtension(extension: ProviderMetadata): void {
    this.store.dispatch(
      unInstallExtension({
        extensionInstanceName: extension.instance!.id,
        extension,
      }),
    );
  }

  private triggerExtensionUninstallMatomoEvent(
    extension: ProviderMetadata,
  ): void {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(take(1))
      .subscribe((ctx) => {
        triggerMatomoEvent('ExtensionUninstalled', {
          extensionProvider: extension.provider,
          extensionName: extension.name,
          projectType: ctx.context.entityContext?.project?.type,
          projectId: ctx.context.projectId,
        });
      });
  }

  async uninstallExtensionDialog(
    extension: ProviderMetadata,
  ): Promise<boolean> {
    const settings: ConfirmationModalSettings = {
      type: 'warning',
      header: $localize`Uninstall Extension` as string,
      body: $localize`Are you sure you want to uninstall the Extension <b>${extension.displayName}</b>? All configurations will be removed.` as string,
      buttonConfirm: $localize`Uninstall` as string,
      buttonDismiss: $localize`Cancel` as string,
    };
    const decision = await this.showConfirmationModal(settings);
    if (decision === ConfirmationDialogDecision.DISMISSED) {
      return false;
    }

    this.uninstallExtension(extension);
    this.triggerExtensionUninstallMatomoEvent(extension);
    return true;
  }

  public showConfirmationModal(
    settings: ConfirmationModalSettings,
  ): Promise<ConfirmationDialogDecision> {
    return this.luigiClient
      .uxManager()
      .showConfirmationModal(settings)
      .then(() => Promise.resolve(ConfirmationDialogDecision.CONFIRMED))
      .catch(() => Promise.resolve(ConfirmationDialogDecision.DISMISSED));
  }

  public isUninstallable(extension: ProviderMetadata): boolean {
    return (
      !this.isDeletionPrevented(extension) &&
      this.hasScopeExtensionInstance(extension) &&
      !this.isExtensionMandatory(extension) &&
      extension?.instance?.status !== ServiceStatus.IN_DELETION
    );
  }

  private isDeletionPrevented(extension: ProviderMetadata): boolean {
    return (
      extension.instance?.providerData?.['disableProjectDeletion'] === 'true'
    );
  }
  private hasScopeExtensionInstance(extension: ProviderMetadata): boolean {
    return !!(
      this.scopeInfo &&
      !!this.scopeInfo.scopeId &&
      extension.instance &&
      extension.instance.scope.type === this.scopeInfo.scopeType
    );
  }

  public isInstallableExtension(extension: ProviderMetadata): boolean {
    return !!(
      this.scopeInfo &&
      !!this.scopeInfo.scopeId &&
      !extension.instance
    );
  }

  public isInstalledExtension(
    extension: ProviderMetadata | undefined,
  ): boolean {
    return !!(
      this.scopeInfo &&
      !!this.scopeInfo.scopeId &&
      !!extension &&
      !!extension.instance
    );
  }

  public isExtensionMandatory(extension: ProviderMetadata): boolean {
    return !!extension.instance && !!extension.instance.isMandatoryExtension;
  }

  public getIcon(extension: ProviderMetadata): string {
    let isDark = false;
    const theme = this.luigiClient.uxManager().getCurrentTheme() as string;
    switch (theme) {
      case 'sap_horizon_dark':
      case 'sap_fiori_hcb':
        isDark = true;
    }

    if (extension.icon) {
      if (isDark) {
        if (extension.icon.dark?.url) {
          return extension.icon.dark.url;
        }
        if (extension.icon.dark?.data) {
          return extension.icon.dark.data;
        }
      }

      // Fall back to light icons if no dark icon data was found
      if (extension.icon.light?.url) {
        return extension.icon.light.url;
      }
      if (extension.icon.light?.data) {
        return extension.icon.light.data;
      }
    }
    // nothing matched so go with the deprecated image value
    return extension.image ?? '';
  }

  public openConfigurationWizard(
    providerName: string | undefined,
    providerDisplayName: string | undefined,
    scope: ScopeType | undefined,
    modalSize?: 'l' | 'm' | 's',
  ) {
    const params: ProviderConfigurationData = {
      providerName: providerName ?? '',
      providerDisplayName: providerDisplayName ?? '',
      scope: scope ?? ScopeType.GLOBAL,
      installableIn: this.scopeInfo?.scopeType ?? ScopeType.GLOBAL,
    };
    this.luigiClient
      .linkManager()
      .fromClosestContext()
      .withParams(params)
      .openAsModal('/extension-configuration', {
        size: modalSize,
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  navigateToProviderDetails(provider: ProviderMetadata) {
    const context = this.luigiClient
      .linkManager()
      .fromContext(this.scopeInfo?.scopeType?.toLowerCase() ?? '');

    context.navigate(provider.name);
  }

  async openDialogForAddAccountType(account: AccountConnection): Promise<void> {
    const linkManager = this.luigiClient.linkManager();
    const route = await linkManager.getCurrentRoute();
    const resultingRoute = route.replace(/(\/projects\/.*)\/.*$/, '$1');
    linkManager
      .withParams({
        type: account.name,
      })
      .navigate(`${resultingRoute}/${account.type.name}`, undefined, true, {
        title:
          $localize`Connect an ${this.accountNamingService.accountNamingConfig().singular}` as string,
        size: 's',
      });
  }

  buildLabels(elem: ProviderMetadata): Label[] {
    const labels =
      elem.labels?.map((l) => ({
        title: l.title,
        color: l.color || this.mapToColorCategory(l.title),
      })) || [];

    if (this.isNew(elem)) {
      return [NEW_LABEL, ...labels];
    }

    return labels;
  }

  mapServiceLevel(serviceLevel: ServiceLevel): string {
    switch (serviceLevel) {
      case ServiceLevel.VeryHigh:
        return '24x7';
      case ServiceLevel.High:
        return '24x5';
      case ServiceLevel.MediumOne:
        return '16x5';
      case ServiceLevel.MediumTwo:
        return '12x5';
      case ServiceLevel.Low:
        return '8x5';
    }
  }

  private mapToColorCategory(title: string): ColorCategory {
    const unicodeVal = title.charAt(0).toLowerCase().charCodeAt(0) || 0;

    return ((unicodeVal % 10) + 1).toString() as ColorCategory;
  }

  private isNew(elem: ProviderMetadata): boolean {
    if (!elem.creationTimestamp) {
      return false;
    }
    const creationDate = new Date(elem.creationTimestamp);
    const dateInThreeMonths = creationDate.setMonth(
      creationDate.getMonth() + 3,
    );

    return dateInThreeMonths >= Date.now();
  }

  private handleInstallProvider() {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(
        filter((data) => data.context.goBackContext === EXTENSION_INSTALLED),
      )
      .subscribe(() => {
        this.notificationService.openSuccessToast('Extension Installed');
        this.luigiClient.clearFrameCache();
        this.store.dispatch(loadProviders());
      });
  }
}
