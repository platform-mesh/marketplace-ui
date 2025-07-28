import { NodeContext } from '../../../models';
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
import { EXTENSION_INSTALLED } from 'models/luigi-go-back';
import {
  Contact,
  Link,
  ProviderMetadata,
  ScopeType,
  ServiceLevel,
} from 'models/provider-metadata';
import { Observable, Subscription, combineLatest, mergeMap, tap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { PolicyDirective } from 'shared/directives/policy';
import { getInstallableScope, triggerMatomoEvent } from 'shared/helpers';
import { readAccountsForAccountConnectionTypes } from 'state/accounts.action';
import { selectAccountsPerConnectionTypes } from 'state/accounts.selectors';
import { isExtensionChanging } from 'state/changing-extension.selectors';
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
  providerObservable: Observable<ProviderMetadata | undefined>;
  providerSubscription?: Subscription;

  isChanging?: Observable<boolean>;
  isUnaccounted: Observable<boolean | undefined> | undefined;
  productOwners: Observable<Contact[]> | undefined;
  communityChannels: Observable<Link[]> | undefined;
  supportChannels: Observable<Link[]> | undefined;

  extension: ProviderMetadata | undefined;
  userIsExtensionAdmin = false;
  private context: NodeContext | undefined;

  constructor(
    private store: Store<ProviderState>,
    private luigiClient: LuigiClient,
    private contextService: PmLuigiContextService,
    private providerService: ProviderService,
  ) {
    this.providerObservable = combineLatest([
      this.store.select(selectScope),
      this.contextService.contextObservable(),
    ]).pipe(
      tap(([scope, contextMessage]) => {
        this.context = contextMessage.context;
        this.store.dispatch(
          loadProviderMetadata({
            providerName: this.context.providerName,
            scope: this.getExtensionScopeFromContext(),
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
    this.providerSubscription = this.providerObservable.subscribe(
      (extension: ProviderMetadata | undefined) => {
        this.extension = extension;
        this.isChanging = this.store.select<boolean>(
          isExtensionChanging(this.extension?.name),
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
                this.providerService.isInstalledExtension(this.extension) &&
                !!this.extension?.accountConnections &&
                accounts.length === 0,
            ),
          );
        if (this.extension?.accountConnections) {
          this.store.dispatch(
            readAccountsForAccountConnectionTypes({
              accountConnectionTypes: this.extension.accountConnections.map(
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
    if (this.extension?.wizardConfig) {
      const wizardDefinition: WizardDefinition | undefined = YAML.parse(
        this.extension.wizardConfig?.wizardDefinition,
      );
      const wizardDefinitionSize = wizardDefinition?.modalSize;

      this.providerService.openConfigurationWizard(
        this.extension.name,
        this.extension.displayName,
        this.extension.scope.type,
        wizardDefinitionSize,
      );
    } else {
      this.providerService.installExtension(this.extension).subscribe(() => {
        this.luigiClient.linkManager().goBack(EXTENSION_INSTALLED);
        if (this.extension) {
          triggerMatomoEvent('InstallExtension', {
            extensionProvider: this.extension.provider,
            extensionName: this.extension.name,
            projectType: this.context?.entityContext?.project?.type,
            projectId: this.context?.projectId,
          });
        }
      });
    }
  }

  protected visitExtension(): void {
    if (this.extension)
      this.providerService.navigateToProviderDetails(this.extension);
  }

  protected async uninstallExtension(): Promise<void> {
    if (this.extension) {
      const extensionIsUninstalled =
        await this.providerService.uninstallExtensionDialog(this.extension);

      if (extensionIsUninstalled) {
        triggerMatomoEvent('UninstallExtension', {
          extensionProvider: this.extension.provider,
          extensionName: this.extension.name,
          projectType: this.context?.entityContext?.project?.type,
          projectId: this.context?.projectId,
        });
      }
    }
  }

  protected showInstallButton(): boolean {
    if (!this.extension) {
      return false;
    }
    return this.providerService.isInstallableExtension(this.extension);
  }

  protected showUninstallButton(): boolean {
    if (!this.extension) {
      return false;
    }
    return this.providerService.isUninstallable(this.extension);
  }

  protected showInstalledLabel(): boolean {
    return this.providerService.isInstalledExtension(this.extension);
  }

  protected getIcon(extension: ProviderMetadata): string {
    return this.providerService.getIcon(extension);
  }

  protected goToExternalLink(URL: string | undefined): void {
    if (URL) {
      window.open(URL, '_blank');
    }
  }

  private getExtensionScopeFromContext(): ScopeType {
    return (
      (this.luigiClient.getNodeParams()['scope'] as ScopeType) ??
      ScopeType.GLOBAL
    );
  }

  private setUserPolicies(context: NodeContext) {
    const entityContext = context?.entityContext;
    const policies =
      entityContext?.project?.policies || entityContext?.team?.policies || [];
    this.userIsExtensionAdmin = policies.includes('providerAdmin');
  }
}
