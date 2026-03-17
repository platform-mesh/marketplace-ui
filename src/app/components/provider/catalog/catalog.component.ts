import { ProviderAllComponent } from '../provider-all/provider-all.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DynamicPageComponent as DynamicPageComponent_1,
  DynamicPageContentComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import { Store } from '@ngrx/store';
import { PmLuigiContextService } from 'services/luigi';
import { ProviderState } from 'state/providerState';
import { loadProviders } from 'state/providers.actions';

@Component({
  selector: 'app-core-page',
  imports: [
    DynamicPageComponent_1,
    DynamicPageTitleComponent,
    DynamicPageContentComponent,
    ProviderAllComponent,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  constructor(
    private store: Store<ProviderState>,
    private pmLuigiContextService: PmLuigiContextService,
  ) {
    this.pmLuigiContextService.contextObservable().subscribe(() => {
      this.store.dispatch(loadProviders());
    });
  }
}
