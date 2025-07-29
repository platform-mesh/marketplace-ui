import { LuigiClient, PmLuigiContextService } from './luigi';
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '@dxp/ngx-core/notification';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { ConfirmationDialogDecision } from 'models/dialog';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import { ProviderConfigurationData } from 'models/provider-configuration-data';
import {
  AccountConnection,
  ColorCategory,
  InstallProviderInput,
  Label,
  MarketplaceEntry,
  ProviderMetadata,
  ScopeType,
  ServiceInstance,
  ServiceLevel,
} from 'models/provider-metadata';
import { filter, take } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';
import { triggerMatomoEvent } from 'shared/helpers';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import { unInstallProviderInstance } from 'state/changing-provider-instance.actions';
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

  installProviderInstance(
    marketplaceEntry: MarketplaceEntry | undefined,
    installationData?: Record<string, unknown>,
  ) {
    if (!marketplaceEntry) {
      throw new Error('Provider is undefined');
    }
    const installProviderInstanceInput: InstallProviderInput = {
      installationData,
      providerInput: {
        id: marketplaceEntry.metadata.name,
      },
      displayName: marketplaceEntry.spec.providerMetadata.spec.displayName,
    };

    return this.graphqlService.installProviderInstance(
      installProviderInstanceInput,
    );
  }

  updateProviderInstance(
    marketplaceEntry: MarketplaceEntry,
    providerInstance: ServiceInstance,
    installationData: Record<string, unknown>,
  ) {
    const updateProviderInstanceInput = {
      installationData,
      instanceId: providerInstance.id,
      providerInput: {
        id: marketplaceEntry.metadata.name,
      },
    };
    return this.graphqlService.updateProviderInstance(
      updateProviderInstanceInput,
    );
  }

  uninstallProviderInstance(marketplaceEntry: MarketplaceEntry): void {
    this.store.dispatch(
      unInstallProviderInstance({
        providerName: marketplaceEntry.metadata.name,
      }),
    );
  }

  private triggerProviderInstanceUninstallMatomoEvent(
    marketplaceEntry: MarketplaceEntry,
  ): void {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(take(1))
      .subscribe((ctx) => {
        triggerMatomoEvent('providerUninstalled', {
          providerProvider:
            marketplaceEntry.spec.providerMetadata.spec.provider,
          providerName: marketplaceEntry.metadata.name,
          projectType: ctx.context.entityContext?.project?.type,
          projectId: ctx.context.projectId,
        });
      });
  }

  async uninstallProviderInstanceDialog(
    marketplaceEntry: MarketplaceEntry,
  ): Promise<boolean> {
    const settings: ConfirmationModalSettings = {
      type: 'warning',
      header: $localize`Uninstall Provider` as string,
      body: $localize`Are you sure you want to uninstall the Provider <b>${marketplaceEntry.spec.providerMetadata.spec.displayName}</b>? All configurations will be removed.` as string,
      buttonConfirm: $localize`Uninstall` as string,
      buttonDismiss: $localize`Cancel` as string,
    };
    const decision = await this.showConfirmationModal(settings);
    if (decision === ConfirmationDialogDecision.DISMISSED) {
      return false;
    }

    this.uninstallProviderInstance(marketplaceEntry);
    this.triggerProviderInstanceUninstallMatomoEvent(marketplaceEntry);
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

  public isUninstallable(marketplaceEntry: MarketplaceEntry): boolean {
    return (
      marketplaceEntry.spec.installed &&
      !this.isDeletionPrevented(marketplaceEntry) &&
      !this.isProviderMandatory(marketplaceEntry)
      // && provider?.instance?.status !== ServiceStatus.IN_DELETION
    );
  }

  private isDeletionPrevented(marketplaceEntry: MarketplaceEntry): boolean {
    return (
      // provider.instance?.providerData?.['disableProjectDeletion'] === 'true'
      !!marketplaceEntry
    );
  }

  public isInstallable(marketplaceEntry: MarketplaceEntry): boolean {
    return !marketplaceEntry.spec.installed;
  }

  public isProviderMandatory(marketplaceEntry: MarketplaceEntry): boolean {
    return (
      !marketplaceEntry.spec.installed &&
      !!marketplaceEntry.spec.providerMetadata.spec.isMandatory
    );
  }

  public getIcon(provider: ProviderMetadata): string {
    let isDark = false;
    const theme = this.luigiClient.uxManager().getCurrentTheme() as string;
    switch (theme) {
      case 'sap_horizon_dark':
      case 'sap_fiori_hcb':
        isDark = true;
    }

    if (provider.spec.icon) {
      if (isDark) {
        if (provider.spec.icon.dark?.url) {
          return provider.spec.icon.dark.url;
        }
        if (provider.spec.icon.dark?.data) {
          return provider.spec.icon.dark.data;
        }
      }

      // Fall back to light icons if no dark icon data was found
      if (provider.spec.icon.light?.url) {
        return provider.spec.icon.light.url;
      }
      if (provider.spec.icon.light?.data) {
        return provider.spec.icon.light.data;
      }
    }
    // nothing matched so go with the deprecated image value
    return provider.spec.image ?? '';
  }

  public openConfigurationWizard(
    providerName: string | undefined,
    providerDisplayName: string | undefined,
    modalSize?: 'l' | 'm' | 's',
  ) {
    const params: ProviderConfigurationData = {
      providerName: providerName ?? '',
      providerDisplayName: providerDisplayName ?? '',
      installableIn: this.scopeInfo?.scopeType ?? ScopeType.GLOBAL,
    };
    this.luigiClient
      .linkManager()
      .fromClosestContext()
      .withParams(params)
      .openAsModal('/provider-configuration', {
        size: modalSize,
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }

  navigateToProviderDetails(marketplaceEntry: MarketplaceEntry) {
    const context = this.luigiClient
      .linkManager()
      .fromContext(this.scopeInfo?.scopeType?.toLowerCase() ?? '');

    context.navigate(marketplaceEntry.metadata.name);
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
      elem.spec.labels?.map((l) => ({
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
    if (!elem.spec.creationTimestamp) {
      return false;
    }
    const creationDate = new Date(elem.spec.creationTimestamp);
    const dateInThreeMonths = creationDate.setMonth(
      creationDate.getMonth() + 3,
    );

    return dateInThreeMonths >= Date.now();
  }

  private handleInstallProvider() {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(
        filter(
          (data) => data.context.goBackContext === PROVIDER_INSTANCE_INSTALLED,
        ),
      )
      .subscribe(() => {
        this.notificationService.openSuccessToast('Provider Installed');
        this.luigiClient.clearFrameCache();
        this.store.dispatch(loadProviders());
      });
  }
}
