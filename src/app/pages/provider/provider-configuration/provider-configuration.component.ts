import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  DxpWizardModule,
  DxpWizardNavigationButtons,
  ExtensionConfigurationWizardConfigSpec,
  WizardConfigError,
} from '@dxp/ngx-core/fundamental-wizard-generator';
import { DxpWizardGeneratorHeader } from '@dxp/ngx-core/fundamental-wizard-generator/dxp-wizard-generator/dxp-wizard-generator.component';
import {
  DxpWizardComponent,
  RunParameter,
  WizardDefinition,
} from '@dxp/ngx-core/wizard';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageFooterComponent,
  DynamicPageHeaderComponent,
} from '@fundamental-ngx/core';
import { Store } from '@ngrx/store';
import {
  GoBackContext,
  LuigiGoBackAction,
  PROVIDER_INSTANCE_INSTALLED,
  PROVIDER_INSTANCE_UPDATED,
} from 'models/luigi-go-back';
import { ProviderConfigurationData } from 'models/provider-configuration-data';
import { MarketplaceEntry, ServiceInstance } from 'models/provider-metadata';
import { WizardConfig } from 'models/wizard-configuration';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { WizardConfigService } from 'services/wizard-config.service';
import { set, triggerMatomoEvent } from 'shared/helpers';
import { getEntityScopeFromContext } from 'shared/utils/entity-context.util';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import { selectProviderMetadata } from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';
import { loadProviders } from 'state/providers.actions';
import YAML from 'yaml';

@Component({
  selector: 'app-provider-configuration',
  imports: [
    DxpWizardModule,
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageContentComponent,
    DynamicPageFooterComponent,
    DxpWizardComponent,
  ],
  templateUrl: './provider-configuration.component.html',
  styleUrl: './provider-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderConfigurationComponent {
  protected navigationButtonLabels: DxpWizardNavigationButtons | undefined;

  protected provider = toSignal(this.getProvider());
  protected serviceInstance = toSignal(this.getServiceInstance());
  protected header = computed(() => {
    return this.getHeader(this.provider());
  });
  protected defaultValues = computed<Record<string, string>>(() => {
    return this.serviceInstance()?.installationData ?? {};
  });
  protected wizardConfig = computed(() => {
    return this.getWizardConfig(
      this.provider(),
      this.defaultValues(),
      !this.serviceInstance(),
    );
  });
  protected configurationData = toSignal(this.getConfigurationData());
  protected isLoading = signal(true);

  protected context = toSignal(this.luigiContextService.contextObservable());

  constructor(
    private readonly store: Store<ProviderState>,
    private readonly luigiClient: LuigiClient,
    private readonly providerService: ProviderService,
    private readonly wizardConfigService: WizardConfigService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly luigiContextService: PmLuigiContextService,
  ) {
    this.store.dispatch(loadProviders());

    this.loadExtensionClass();
  }

  protected wizardError(wizardError: WizardConfigError | Error): void {
    this.luigiClient.linkManager().goBack({
      action: LuigiGoBackAction.WIZARD_CONFIG_ERROR,
      provider: this.provider(),
      wizardConfigError: wizardError,
    } as GoBackContext);
  }

  protected wizardFinished(wizardValues: Record<string, string>): void {
    const installationData = wizardValues;

    const extensionInstance = this.serviceInstance();
    const marketplaceEntry = this.provider();
    if (extensionInstance && marketplaceEntry) {
      this.providerService
        .updateProviderInstance(
          marketplaceEntry,
          extensionInstance,
          installationData,
        )
        .subscribe(() => {
          this.closeDialog(PROVIDER_INSTANCE_UPDATED);
        });
    } else if (marketplaceEntry) {
      this.providerService
        .installProviderInstance(marketplaceEntry, installationData)
        .subscribe(() => {
          this.closeDialog(PROVIDER_INSTANCE_INSTALLED);
          triggerMatomoEvent(
            'InstallExtension',
            this.getMatomoEventObject(marketplaceEntry),
          );
        });
    }
  }

  private getMatomoEventObject(marketplaceEntry: MarketplaceEntry) {
    return {
      provider: marketplaceEntry?.spec.providerMetadata.spec.displayName,
      providerName: marketplaceEntry?.metadata.name,
      entityType: getEntityScopeFromContext(this.context()?.context).entityType,
      entitytId: getEntityScopeFromContext(this.context()?.context).entityId,
    };
  }

  protected closeDialog(
    msg?: 'PROVIDER_INSTANCE_UPDATED' | 'PROVIDER_INSTANCE_INSTALLED',
  ): void {
    this.luigiClient.linkManager().goBack(msg);
  }

  protected finish($event: RunParameter[]): void {
    const result: Record<string, string> = {};
    for (const param of $event) {
      set(result, param.name, param.value);
    }
    this.wizardFinished(result);
  }

  private getConfigurationData(): Observable<ProviderConfigurationData> {
    return combineLatest([
      this.activatedRoute.queryParams,
      this.luigiContextService.contextObservable(),
    ]).pipe(
      map(() => {
        return this.luigiClient.getNodeParams(
          true,
        ) as unknown as ProviderConfigurationData;
      }),
    );
  }

  private getProvider(): Observable<Readonly<MarketplaceEntry> | undefined> {
    return this.store
      .select(selectProviderMetadata)
      .pipe(filter((ext) => !!ext));
  }

  private getServiceInstance(): Observable<ServiceInstance | undefined> {
    return this.store.select(selectSelectedProvider).pipe(
      filter((ext) => !!ext),
      map((serviceInstance) => {
        this.navigationButtonLabels = {
          finish: { label: serviceInstance ? 'Save' : 'Install' },
        };
        this.isLoading.set(false);
        // return serviceInstance.instance!; todo gkr
        return {} as any;
      }),
    );
  }

  private getHeader(
    marketplaceEntry: MarketplaceEntry | undefined,
  ): DxpWizardGeneratorHeader {
    const header: Record<string, unknown> = {};
    if (marketplaceEntry) {
      header['icon'] = this.providerService.getIcon(
        marketplaceEntry.spec.providerMetadata,
      );
      if (marketplaceEntry.spec.providerMetadata.spec.displayName) {
        header['title'] =
          marketplaceEntry.spec.providerMetadata.spec.displayName;
      }
      if (marketplaceEntry.spec.providerMetadata.spec.category) {
        header['subtitle'] =
          marketplaceEntry.spec.providerMetadata.spec.category;
      }
    }
    return header;
  }

  private getWizardConfig(
    marketplaceEntry: MarketplaceEntry | undefined,
    defaultValues: Record<string, string> | undefined,
    isInstall: boolean,
  ): WizardConfig | undefined {
    if (!marketplaceEntry) {
      return undefined;
    }

    if (
      marketplaceEntry.spec.providerMetadata.spec.wizardConfig
        ?.wizardDefinition &&
      !defaultValues &&
      !isInstall
    ) {
      return undefined;
    }

    if (
      !marketplaceEntry.spec.providerMetadata.spec.wizardConfig?.configData &&
      !marketplaceEntry.spec.providerMetadata.spec.wizardConfig
        ?.wizardDefinition
    ) {
      this.luigiClient.linkManager().goBack({
        action: LuigiGoBackAction.WIZARD_CONFIG_ERROR,
        wizardConfigError: {
          title: 'Cannot generate steps without extension wizard configuration',
          message:
            'No extension class was provided or the wizard configuration on the extension class is missing.',
        },
      } as GoBackContext);
    }

    let wizardConfig = {
      dxpWizardConfiguration: JSON.parse(
        marketplaceEntry.spec.providerMetadata.spec.wizardConfig?.configData ??
          '',
      ) as ExtensionConfigurationWizardConfigSpec,
      wizardDefinition: YAML.parse(
        marketplaceEntry.spec.providerMetadata.spec.wizardConfig
          ?.wizardDefinition ?? '',
      ) as WizardDefinition,
    } as WizardConfig;

    wizardConfig =
      this.wizardConfigService.mapRequiredStepsToShowAsRequired(wizardConfig);

    return this.wizardConfigService.setDefaultValues(
      defaultValues,
      wizardConfig,
    );
  }

  private loadExtensionClass() {
    effect(
      () => {
        const configurationData = this.configurationData();

        if (!configurationData) {
          return;
        }

        this.store.dispatch(
          loadProviderMetadata({
            providerName: configurationData.providerName,
            installableIn: [configurationData.installableIn],
          }),
        );
      },
      { allowSignalWrites: true },
    );
  }
}
