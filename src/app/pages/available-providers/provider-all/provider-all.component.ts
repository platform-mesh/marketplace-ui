import { ProviderEmptyComponent } from '../../provider/provider-empty/provider-empty.component';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { LinkComponent } from '@fundamental-ngx/platform/link';
import { ModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { MarketplaceEntry, ProviderMetadata } from 'models/provider-metadata';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  skip,
} from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import {
  AdditionalInfo,
  CatalogDataItem,
  CoreCatalogComponent,
  InfoLabelFilter,
} from 'shared/components/catalog';
import { triggerMatomoEvent } from 'shared/helpers';
import { ProviderState } from 'state/providerState';
import { selectAllProviders } from 'state/providers.selectors';

export interface ProviderCatalogDataItem extends CatalogDataItem {
  id?: string;
  scope?: string;
}

@Component({
  selector: 'app-provider-all',
  imports: [
    CoreCatalogComponent,
    LinkComponent,
    ProviderEmptyComponent,
    AsyncPipe,
  ],
  templateUrl: './provider-all.component.html',
  styleUrl: './provider-all.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderAllComponent implements OnInit {
  @Input({ required: true })
  isFeatureMode = false;

  @Input()
  infoLabelFilters?: Observable<InfoLabelFilter[] | undefined>;

  @Input()
  title?: string;

  initialFilter?: string;
  isLoading: Subject<boolean> = new BehaviorSubject(true);
  installableProviders: Observable<ProviderCatalogDataItem[]>;
  private projectId?: string;
  private projectType?: string;

  constructor(
    private store: Store<ProviderState>,
    private providerService: ProviderService,
    private luigiClient: LuigiClient,
    private pmLuigiContextService: PmLuigiContextService,
  ) {
    this.installableProviders = combineLatest([
      this.store.select(selectAllProviders),
    ]).pipe(
      skip(1),
      map(([marketplaceEntries]) => {
        this.isLoading.next(false);
        return marketplaceEntries.reduce(
          (
            total: ProviderCatalogDataItem[],
            marketplaceEntry: MarketplaceEntry,
          ) => {
            let badge = '';
            if (marketplaceEntry.spec.installed && !this.isFeatureMode) {
              badge = 'INSTALLED';
            }
            const labels = this.providerService.buildLabels(
              marketplaceEntry.spec.providerMetadata,
            );

            total.push({
              id: marketplaceEntry.metadata.name,
              testId: `app-extensions-catalog-all-card-${marketplaceEntry.metadata.name}-entity`,
              title: marketplaceEntry.spec.providerMetadata.spec.displayName,
              description:
                marketplaceEntry.spec.providerMetadata.spec.description,
              image: this.providerService.getIcon(
                marketplaceEntry.spec.providerMetadata,
              ),
              verification:
                marketplaceEntry.spec.providerMetadata.spec.verification,
              category: marketplaceEntry.spec.providerMetadata.spec.category,
              provider: marketplaceEntry.spec.providerMetadata.spec.provider,
              badge: {
                text: badge,
                color: 'var(--sapPositiveColor)',
              },
              labels,
              additionalInfo: this.buildAdditionalInfo(
                marketplaceEntry.spec.providerMetadata,
              ),
            });
            return total;
          },
          [],
        );
      }),
    );
  }

  ngOnInit(): void {
    this.pmLuigiContextService
      .contextObservable()
      .pipe(take(1))
      .subscribe((ctx) => {
        this.projectId = ctx.context.projectId;
        this.projectType = ctx.context.entityContext?.project?.type;
        this.initialFilter = this.luigiClient.getNodeParams(true)['q'] || '';
      });
  }

  private triggerMatomoAnalyticsEvent(
    catalogDataItem: ProviderCatalogDataItem,
  ) {
    if (!this.title) {
      // If the title is undefined then trigger the catalog view item trigger, with the corresponding values
      triggerMatomoEvent('ViewExtensionItem', {
        extensionName: catalogDataItem.title,
        extensionProvider: catalogDataItem.provider,
      });
    } else if (this.title == 'Marketplace') {
      // If the title is Marketplace then trigger the marketplace view item trigger, with the corresponding values
      triggerMatomoEvent('ViewExtensionItem', {
        extensionName: catalogDataItem.title,
        extensionProvider: catalogDataItem.provider,
        projectId: this.projectId,
        projectType: this.projectType,
      });
    }
  }

  navigate(catalogDataItem: ProviderCatalogDataItem) {
    this.triggerMatomoAnalyticsEvent(catalogDataItem);
    const title = `Provider Details - ${catalogDataItem.title}`;
    if (this.isFeatureMode) {
      void this.luigiClient
        .linkManager()
        .openAsModal(`/provider/${catalogDataItem.id}`, {
          title,
        });
    } else {
      void this.luigiClient
        .linkManager()
        .fromParent()
        .withParams({
          scope: catalogDataItem.scope || '',
        })
        .openAsModal(`provider/${catalogDataItem.id}`, {
          title,
          keepPrevious: true,
        } as ModalSettings);
    }
  }

  writeQueryParam(query: string): void {
    const q = query.length ? query : '';

    this.luigiClient.addNodeParams({ q }, true);
  }

  private buildAdditionalInfo(
    providerMetadata: ProviderMetadata,
  ): AdditionalInfo[] {
    const additionalInfo: AdditionalInfo[] = [];
    if (providerMetadata.spec.category) {
      additionalInfo.push({
        label: 'Category',
        value: providerMetadata.spec.category,
      });
    }
    return additionalInfo;
  }
}
