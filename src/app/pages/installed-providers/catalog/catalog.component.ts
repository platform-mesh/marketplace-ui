import { ProviderAllComponent } from '../../available-providers/provider-all/provider-all.component';
import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';
import { DynamicPageComponent } from '@fundamental-ngx/platform';
import {
  DynamicPageComponent as DynamicPageComponent_1,
  DynamicPageContentComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import { Store } from '@ngrx/store';
import { BehaviorSubject, map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { PmLuigiContextService } from 'services/luigi';
import { InfoLabelFilter } from 'shared/components/catalog';
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
  @ViewChild(DynamicPageComponent)
  dynamicPage?: DynamicPageComponent;

  infoLabelFilters?: Observable<InfoLabelFilter[] | undefined>;
  protected isFeatureToggle: Signal<boolean> = toSignal(this.getRouteData(), {
    initialValue: false,
  });

  constructor(
    private store: Store<ProviderState>,
    private route: ActivatedRoute,
    private pmLuigiContextService: PmLuigiContextService,
  ) {
    this.setInfoLabels();
  }

  private setInfoLabels() {
    const subject = new BehaviorSubject<InfoLabelFilter[] | undefined>([]);
    this.infoLabelFilters = subject.asObservable();
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams: ParamMap) => {
        const infoFilters = this.buildInfoLabelFilters(queryParams);
        subject.next(infoFilters);
      });
    this.pmLuigiContextService.contextObservable().subscribe(() => {
      this.store.dispatch(loadProviders());
    });
  }

  private getRouteData(): Observable<boolean> {
    return this.route.data.pipe(
      map((data: Data) => (data.isFeatureMode as boolean) ?? true),
    );
  }

  buildInfoLabelFilters(queryParams?: ParamMap): InfoLabelFilter[] | undefined {
    if (!queryParams?.keys.length) {
      return undefined;
    }

    return queryParams.keys.map((label) => {
      const stringValues = decodeURIComponent(queryParams.get(label) || '');
      return {
        label,
        values: stringValues.split(',').map((v) => v.trim()),
      };
    });
  }
}
