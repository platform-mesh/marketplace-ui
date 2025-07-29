import { MarketplaceEntry, NodeContext } from '../../../models';
import { ProviderVerificationComponent } from '../../provider-verification/provider-verification.component';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DxpProviderVerificationModule } from '@dxp/ngx-core/provider-verification';
import { WizardDefinition } from '@dxp/ngx-core/wizard';
import {
  ButtonComponent,
  ContentDensityDirective,
  LinkComponent,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import {
  FacetComponent,
  FacetContentComponent,
  FacetGroupComponent,
} from '@fundamental-ngx/core/facets';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { MessageStripComponent } from '@fundamental-ngx/core/message-strip';
import { TextComponent } from '@fundamental-ngx/core/text';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageKeyInfoComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import { Store } from '@ngrx/store';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import {
  Contact,
  Link,
  ProviderMetadata,
  ServiceLevel,
} from 'models/provider-metadata';
import { Observable, Subscription, combineLatest, mergeMap, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { PolicyDirective } from 'shared/directives/policy';
import { getInstallableScope, triggerMatomoEvent } from 'shared/helpers';
import { getEntityScopeFromContext } from 'shared/utils/entity-context.util';
import { readAccountsForAccountConnectionTypes } from 'state/accounts.action';
import { selectAccountsPerConnectionTypes } from 'state/accounts.selectors';
import { isProviderInstanceChanging } from 'state/changing-provider-instance.selectors';
import { selectScope } from 'state/luigi.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import {
  selectProviderMetadata,
  selectProviderMetadataCommunityLinks,
  selectProviderMetadataProductOwners,
  selectProviderMetadataSupportLinks,
} from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';
import YAML from 'yaml';

@Component({
  selector: 'app-provider-detail-dialog',
  imports: [
    MessageStripComponent,
    DynamicPageComponent,
    LinkComponent,
    DynamicPageTitleComponent,
    DynamicPageKeyInfoComponent,
    InfoLabelComponent,
    DynamicPageGlobalActionsComponent,
    ToolbarComponent,
    ButtonComponent,
    DynamicPageHeaderComponent,
    FacetGroupComponent,
    FacetComponent,
    AvatarComponent,
    DxpProviderVerificationModule,
    DynamicPageContentComponent,
    TitleComponent,
    FacetContentComponent,
    FormLabelComponent,
    TextComponent,
    AsyncPipe,
    ContentDensityDirective,
    ProviderVerificationComponent,
    PolicyDirective,
  ],
  templateUrl: './provider-detail-dialog.component.html',
  styleUrl: './provider-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderDetailDialogComponent implements OnInit, OnDestroy {
  marketplaceEntryObservable: Observable<MarketplaceEntry>;
  providerSubscription?: Subscription;

  isChanging?: Observable<boolean>;
  isUnaccounted: Observable<boolean | undefined> | undefined;
  productOwners: Observable<Contact[]> | undefined;
  communityChannels: Observable<Link[]> | undefined;
  supportChannels: Observable<Link[]> | undefined;

  marketplaceEntry!: MarketplaceEntry;
  providerMetadata!: ProviderMetadata;
  userIsProviderAdmin = false;
  private context: NodeContext | undefined;

  constructor(
    private store: Store<ProviderState>,
    private luigiClient: LuigiClient,
    private contextService: PmLuigiContextService,
    private providerService: ProviderService,
  ) {
    this.marketplaceEntryObservable = combineLatest([
      this.store.select(selectScope),
      this.contextService.contextObservable(),
    ]).pipe(
      tap(([scope, contextMessage]) => {
        this.context = contextMessage.context;
        this.store.dispatch(
          loadProviderMetadata({
            providerName: this.context.providerName,
            installableIn: getInstallableScope(scope),
          }),
        );
        this.setUserPolicies(this.context);
      }),
      mergeMap(() => this.store.select(selectProviderMetadata)),
      filter((x) => !!x),
    );
  }

  ngOnInit(): void {
    this.providerSubscription = this.marketplaceEntryObservable.subscribe(
      (marketplaceEntry: MarketplaceEntry) => {
        this.marketplaceEntry = marketplaceEntry;
        this.providerMetadata = marketplaceEntry?.spec.providerMetadata;
        this.isChanging = this.store.select<boolean>(
          isProviderInstanceChanging(this.marketplaceEntry?.metadata.name),
        );
        this.productOwners = this.store.select<Contact[]>(
          selectProviderMetadataProductOwners,
        );
        this.communityChannels = this.store.select<Link[]>(
          selectProviderMetadataCommunityLinks,
        );
        this.supportChannels = this.store.select<Link[]>(
          selectProviderMetadataSupportLinks,
        );
        this.isUnaccounted = this.store
          .select(selectAccountsPerConnectionTypes)
          .pipe(
            map(
              (accounts) =>
                this.marketplaceEntry?.spec.installed &&
                !!this.marketplaceEntry?.spec.providerMetadata.spec
                  .accountConnections &&
                accounts.length === 0,
            ),
          );
        if (
          this.marketplaceEntry?.spec.providerMetadata.spec.accountConnections
        ) {
          this.store.dispatch(
            readAccountsForAccountConnectionTypes({
              accountConnectionTypes:
                this.marketplaceEntry.spec.providerMetadata.spec.accountConnections.map(
                  (e) => e.name,
                ),
            }),
          );
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.providerSubscription?.unsubscribe();
  }

  mapServiceLevel(serviceLevel: ServiceLevel): string {
    return this.providerService.mapServiceLevel(serviceLevel);
  }

  protected installExtension(): void {
    if (this.providerMetadata?.spec.wizardConfig) {
      const wizardDefinition: WizardDefinition | undefined = YAML.parse(
        this.providerMetadata?.spec.wizardConfig?.wizardDefinition,
      );
      const wizardDefinitionSize = wizardDefinition?.modalSize;

      this.providerService.openConfigurationWizard(
        this.providerMetadata?.spec.name,
        this.providerMetadata?.spec.displayName,
        wizardDefinitionSize,
      );
    } else {
      this.providerService
        .installProviderInstance(this.marketplaceEntry)
        .subscribe(() => {
          this.luigiClient.linkManager().goBack(PROVIDER_INSTANCE_INSTALLED);
          if (this.marketplaceEntry) {
            triggerMatomoEvent('InstallExtension', this.getMatomoEventObject());
          }
        });
    }
  }

  private getMatomoEventObject() {
    return {
      provider: this.marketplaceEntry?.spec.providerMetadata.spec.displayName,
      providerName: this.marketplaceEntry?.metadata.name,
      entityType: getEntityScopeFromContext(this.context).entityType,
      entitytId: getEntityScopeFromContext(this.context).entityId,
    };
  }

  protected visitExtension(): void {
    if (this.marketplaceEntry) {
      this.providerService.navigateToProviderDetails(this.marketplaceEntry);
    }
  }

  protected async uninstallExtension(): Promise<void> {
    if (this.marketplaceEntry) {
      const extensionIsUninstalled =
        await this.providerService.uninstallProviderInstanceDialog(
          this.marketplaceEntry,
        );

      if (extensionIsUninstalled) {
        triggerMatomoEvent('UninstallExtension', this.getMatomoEventObject());
      }
    }
  }

  protected showInstallButton(): boolean {
    if (!this.marketplaceEntry) {
      return false;
    }
    return this.providerService.isInstallable(this.marketplaceEntry);
  }

  protected showUninstallButton(): boolean {
    if (!this.marketplaceEntry) {
      return false;
    }
    return this.providerService.isUninstallable(this.marketplaceEntry);
  }

  protected showInstalledLabel(): boolean {
    return this.marketplaceEntry?.spec.installed;
  }

  protected getIcon(extension: ProviderMetadata): string {
    return this.providerService.getIcon(extension);
  }

  protected goToExternalLink(URL: string | undefined): void {
    if (URL) {
      window.open(URL, '_blank');
    }
  }

  private setUserPolicies(context: NodeContext) {
    const entityContext = context?.entityContext;
    const policies =
      entityContext?.project?.policies || entityContext?.team?.policies || [];
    this.userIsProviderAdmin = policies.includes('providerAdmin');
  }
}
