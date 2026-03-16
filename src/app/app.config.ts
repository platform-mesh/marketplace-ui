import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { initializeMatomo } from './initialize-matomo';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { ENV } from '@dxp/ngx-core/common';
import {
  DxpFundamentalDialogServiceReplacer,
  DxpFundamentalMessageBoxServiceReplacer,
} from '@dxp/ngx-core/fundamental';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { NotificationService } from '@dxp/ngx-core/notification';
import { provideLuigiState } from '@dxp/ngx-core/state';
import {
  ContentDensityMode,
  ContentDensityService,
  RtlService,
  provideContentDensity,
  provideMessageToastConfig,
  provideTheming,
} from '@fundamental-ngx/core';
import { provideDialogService } from '@fundamental-ngx/core/dialog';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideNamedApollo } from 'apollo-angular';
import { WizardConfigService } from 'services/wizard-config.service';
import { ProviderInstanceEffects } from 'state/changing-provider-instance.effects';
import { changingProviderInstanceReducer } from 'state/changing-provider-instance.reducer';
import { CommonEffects } from 'state/common.effects';
import { DetailViewEffect } from 'state/detail-view.effect';
import { detailViewReducer } from 'state/detail-view.reducer';
import { ProviderMetadataEffects } from 'state/provider-metadata.effects';
import { providerMetadataReducer } from 'state/provider-metadata.reducers';
import { ProviderState } from 'state/providerState';
import { ProvidersEffects } from 'state/providers.effects';
import { providersReducer } from 'state/providers.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    ContentDensityService,
    DxpFundamentalDialogServiceReplacer,
    DxpFundamentalMessageBoxServiceReplacer,
    LuigiClient,
    RtlService,
    WizardConfigService,
    provideNamedApollo(() => ({})),
    provideRouter(routes, withHashLocation()),
    provideContentDensity({
      storage: 'memory',
      defaultGlobalContentDensity: ContentDensityMode.COMPACT,
    }),
    provideMessageToastConfig({}),
    NotificationService,
    provideLuigiState(),
    provideStore<ProviderState>({
      marketplaceEntries: providersReducer,
      marketplaceEntry: providerMetadataReducer,
      changingProviderNames: changingProviderInstanceReducer,
      detailView: detailViewReducer,
    }),
    provideEffects([
      DetailViewEffect,
      ProviderMetadataEffects,
      ProvidersEffects,
      ProviderInstanceEffects,
      CommonEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    provideTheming({ themeQueryParam: 'sap-theme' }),
    provideDialogService(),
    { provide: ENV, useValue: environment },
    provideHttpClient(withInterceptorsFromDi()),
    provideNoopAnimations(),
    provideAppInitializer(() => {
      initializeMatomo();
    }),
  ],
};
