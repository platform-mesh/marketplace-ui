import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationModule } from '@dxp/ngx-core/authorization';
import { ContentDensityDirective } from '@fundamental-ngx/core';
import { ButtonComponent } from '@fundamental-ngx/core/button';
import {
  IllustratedMessageActionsComponent,
  IllustratedMessageComponent,
  IllustratedMessageFigcaptionComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core/illustrated-message';
import { LinkComponent } from '@fundamental-ngx/core/link';
import { Store } from '@ngrx/store';
import { MarketplaceEntry } from 'models/provider-metadata';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { ProviderState } from 'state/providerState';
import { loadProviders } from 'state/providers.actions';
import { selectAllProviders } from 'state/providers.selectors';

@Component({
  selector: 'app-provider-missing-mandatory-data',
  imports: [
    AuthorizationModule,
    IllustratedMessageComponent,
    IllustratedMessageFigcaptionComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageTextDirective,
    IllustratedMessageActionsComponent,
    ButtonComponent,
    LinkComponent,
    ContentDensityDirective,
  ],
  templateUrl: './provider-missing-mandatory-data.component.html',
  styleUrl: './provider-missing-mandatory-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderMissingMandatoryDataComponent
  implements OnInit, OnDestroy
{
  projectId = '';
  marketplaceEntry: MarketplaceEntry | undefined;
  ngUnsubscribe = new Subject<void>();

  title = 'Mandatory Data Missing';
  msg = 'The Extension has to be configured.';

  sceneConfig = {
    scene: {
      url: 'assets/images/tnt-Scene-Tools.svg',
      id: 'tnt-Scene-Tools',
    },
    dialog: {
      url: 'assets/images/tnt-Dialog-Tools.svg',
      id: 'tnt-Dialog-Tools',
    },
  };

  constructor(
    private luigiClient: LuigiClient,
    private luigiContextService: PmLuigiContextService,
    private route: ActivatedRoute,
    private store: Store<ProviderState>,
    private providerService: ProviderService,
  ) {}

  ngOnInit(): void {
    this.luigiContextService
      .contextObservable()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((ctx) => {
        this.projectId = ctx.context.projectId ?? '';
      });

    this.store.dispatch(loadProviders());

    combineLatest([this.store.select(selectAllProviders), this.route.params])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([marketplaceEntries, params]) => {
        this.marketplaceEntry = marketplaceEntries.find(
          (e) =>
            e.metadata.name === (params['providerName'] as string) || undefined,
        );
      });
  }

  openExtensionConfiguration(): void {
    if (this.marketplaceEntry) {
      this.providerService.openConfigurationWizard(
        this.marketplaceEntry.metadata.name,
        this.marketplaceEntry.spec.providerMetadata.spec.displayName,
      );
    }
  }

  navigateToMembers(): void {
    this.luigiClient
      .linkManager()
      .navigate(`/projects/${this.projectId}/members`);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
