import { ProviderVerificationComponent } from '../../provider-verification/provider-verification.component';
import { ProviderAccountsTableComponent } from './provider-accounts/provider-accounts-table.component';
import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AuthorizationModule } from '@dxp/ngx-core/authorization';
import { DxpProviderVerificationModule } from '@dxp/ngx-core/provider-verification';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import {
  FacetComponent,
  FacetGroupComponent,
} from '@fundamental-ngx/core/facets';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import { IconComponent } from '@fundamental-ngx/core/icon';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { LinkComponent } from '@fundamental-ngx/core/link';
import { ObjectStatusComponent } from '@fundamental-ngx/core/object-status';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';
import { DynamicPageComponent } from '@fundamental-ngx/platform';
import { ButtonComponent } from '@fundamental-ngx/platform/button';
import {
  DynamicPageComponent as DynamicPageComponent_1,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import { Store } from '@ngrx/store';
import {
  MarketplaceEntry,
  ProviderMetadata,
  ServiceInstanceStatusValue,
  ServiceLevel,
} from 'models/provider-metadata';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ProviderService } from 'services/provider.service';
import { getExtensionClassStatusValue } from 'shared/helpers';
import { readAccountsForAccountConnectionTypes } from 'state/accounts.action';
import { isProviderInstanceChanging } from 'state/changing-provider-instance.selectors';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import { ProviderState } from 'state/providerState';
import { loadProviders } from 'state/providers.actions';

@Component({
  selector: 'app-provider-details',
  imports: [
    NgTemplateOutlet,
    DynamicPageComponent_1,
    DynamicPageTitleComponent,
    DynamicPageGlobalActionsComponent,
    ToolbarComponent,
    AuthorizationModule,
    ButtonComponent,
    DynamicPageHeaderComponent,
    FacetGroupComponent,
    FacetComponent,
    AvatarComponent,
    DxpProviderVerificationModule,
    ProviderAccountsTableComponent,
    ObjectStatusComponent,
    InfoLabelComponent,
    DynamicPageContentComponent,
    TitleComponent,
    LinkComponent,
    IconComponent,
    ProviderVerificationComponent,
    FormLabelComponent,
    AsyncPipe,
    DatePipe,
  ],
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderDetailsComponent implements OnDestroy {
  status$: Observable<ServiceInstanceStatusValue | undefined>;
  marketplaceEntry!: MarketplaceEntry;
  marketplaceEntryObservable = new Observable<MarketplaceEntry>();
  isChanging: Observable<boolean> | undefined;
  ngUnsubscribe = new Subject<void>();
  // Fundamental Platform Dynamic Page doesn't automatically open the first tab
  // so we use this variable to track if we need to open it on Extension change
  dynamicPageInitialized = false;

  @ViewChild(DynamicPageComponent)
  dynamicPage: DynamicPageComponent | undefined;

  constructor(
    private store: Store<ProviderState>,
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef,
  ) {
    this.selectExtension();

    this.status$ = this.marketplaceEntryObservable.pipe(
      map(getExtensionClassStatusValue),
    );

    this.getExtension();
  }

  private selectExtension() {
    this.store.dispatch(loadProviders());

    this.marketplaceEntryObservable = this.store
      .select(selectSelectedProvider)
      .pipe(filter((ext): ext is MarketplaceEntry => !!ext));
  }

  private getExtension() {
    this.marketplaceEntryObservable
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((x) => !!x),
      )
      .subscribe((extension) => {
        this.marketplaceEntry = extension;

        this.isChanging = this.store.select<boolean>(
          isProviderInstanceChanging(this.marketplaceEntry?.metadata.name),
        );

        if (
          this.hasAccountType() &&
          this.marketplaceEntry.spec.providerMetadata.spec.accountConnections
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

        this.dynamicPageInitialized = false;
        this.cdr.detectChanges();
      });
  }

  public showEditButton(): boolean {
    return !!(
      this.marketplaceEntry?.spec.providerMetadata.spec.template ||
      this.marketplaceEntry?.spec.providerMetadata.spec.wizardConfig
    );
  }

  public getIcon(extension: ProviderMetadata): string {
    return this.providerService.getIcon(extension);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  editExtension() {
    this.providerService.openConfigurationWizard(
      this.marketplaceEntry?.metadata.name,
      this.marketplaceEntry?.spec.providerMetadata.spec.displayName,
    );
  }

  hasAccountType(): boolean {
    return !!this.marketplaceEntry?.spec.providerMetadata.spec
      .accountConnections;
  }

  mapServiceLevel(serviceLevel: ServiceLevel): string {
    return this.providerService.mapServiceLevel(serviceLevel);
  }
}
