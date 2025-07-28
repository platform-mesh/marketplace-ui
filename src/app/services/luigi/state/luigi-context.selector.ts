import { luigiFeatureSelector } from './luigi-feature.selector';
import { createSelector } from '@ngrx/store';

export const luigiContextSelector = createSelector(
  luigiFeatureSelector,
  (luigi) => luigi.context,
);

export const luigiContextUserIDSelector = createSelector(
  luigiContextSelector,
  (context) => context?.userid,
);

export const luigiContextTenantIDSelector = createSelector(
  luigiContextSelector,
  (context) => context?.tenantid,
);

export const luigiContextProjectIDSelector = createSelector(
  luigiContextSelector,
  (context) => context?.projectId,
);
