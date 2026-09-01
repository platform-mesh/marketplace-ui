import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketplaceEntry, NodeContext } from 'models/index';
import {
  PermissionClaimSelector,
  ProviderMetadataFilter,
} from 'models/provider-metadata';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ApolloFactory } from 'services/apollo-factory';
import { LuigiClient } from 'services/luigi';
import { luigiContextSelector } from 'services/luigi/state';
import {
  createAPIBindingMutation,
  deleteAPIBindingMutation,
  getMarketplaceEntriesQuery,
} from 'services/marketplace-graphql.queries';

interface MarketplaceEntriesResponse {
  marketplace_platform_mesh_io: {
    v1alpha1: {
      MarketplaceEntries: {
        items: MarketplaceEntry[];
      };
    };
  };
}

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private luigiClient = inject(LuigiClient);
  private store = inject(Store);
  private apolloFactory = inject(ApolloFactory);

  createExtFilter(installableIn?: string[]): ProviderMetadataFilter {
    return installableIn
      ? { installableIn, excludeHiddenExtensions: true }
      : { excludeHiddenExtensions: true };
  }

  getMarketplaceEntries(
    installableIn?: string[],
    extFilter?: ProviderMetadataFilter,
  ): Observable<MarketplaceEntry[]> {
    if (!extFilter) {
      extFilter = this.createExtFilter(installableIn);
    }

    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) => {
        return this.apolloFactory
          .marketplace(context)
          .query<MarketplaceEntriesResponse>({
            query: getMarketplaceEntriesQuery,
            variables: {
              filter: extFilter,
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map((apolloResponse) => {
              if (!apolloResponse.data) {
                throw new Error('Marketplace response did not contain data');
              }
              return apolloResponse.data.marketplace_platform_mesh_io.v1alpha1
                .MarketplaceEntries.items;
            }),
          );
      }),
    );
  }

  installProviderInstance(entry: MarketplaceEntry): Observable<unknown> {
    const generateName = entry.metadata.name + '-';
    const metadata = JSON.parse(entry.spec.apiExport.metadata);
    const apiExportPath = metadata.annotations['kcp.io/path'];
    const apiExportName = metadata.name;

    const acceptedPermissionClaims =
      entry.spec?.apiExport?.spec?.permissionClaims?.map((claim) => {
        return {
          state: 'Accepted',
          group: claim.group ?? '',
          resource: claim.resource,
          identityHash: claim.identityHash,
          verbs: [...claim.verbs],
          selector: this.toBindingSelector(
            claim.defaultSelector,
            claim.group ?? '',
            claim.resource,
          ),
        };
      });

    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) =>
        this.apolloFactory
          .workspace(context)
          .mutate({
            mutation: createAPIBindingMutation,
            variables: {
              generateName: generateName,
              apiExportName: apiExportName,
              apiExportPath: apiExportPath,
              permissionClaims: acceptedPermissionClaims,
            },
          })
          .pipe(
            tap(() => {
              this.sendReloadConfigCustomMessage(
                'installProviderInstance',
                context,
              );
            }),
          ),
      ),
    );
  }

  unInstallExtension(name: string): Observable<unknown> {
    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) =>
        this.apolloFactory
          .workspace(context)
          .mutate({
            mutation: deleteAPIBindingMutation,
            variables: {
              name: name,
            },
          })
          .pipe(
            tap(() => {
              this.sendReloadConfigCustomMessage('unInstallExtension', context);
            }),
          ),
      ),
    );
  }

  private toBindingSelector(
    defaultSelector: PermissionClaimSelector | null | undefined,
    group: string,
    resource: string,
  ): PermissionClaimSelector {
    if (defaultSelector == null) {
      return { matchAll: true };
    }

    const matchLabels = defaultSelector.matchLabels
      ? { ...defaultSelector.matchLabels }
      : undefined;
    const matchExpressions = defaultSelector.matchExpressions?.map(
      ({ key, operator, values }) => {
        if (!key || !operator) {
          throw this.invalidDefaultSelector(group, resource);
        }

        return {
          key,
          operator,
          ...(values == null ? {} : { values: [...values] }),
        };
      },
    );
    const hasMatchLabels =
      matchLabels !== undefined && Object.keys(matchLabels).length > 0;
    const hasMatchExpressions =
      matchExpressions !== undefined && matchExpressions.length > 0;

    if (defaultSelector.matchAll === true) {
      if (hasMatchLabels || hasMatchExpressions) {
        throw this.invalidDefaultSelector(group, resource);
      }

      return { matchAll: true };
    }

    if (!hasMatchLabels && !hasMatchExpressions) {
      throw this.invalidDefaultSelector(group, resource);
    }

    return {
      ...(defaultSelector.matchAll === false ? { matchAll: false } : {}),
      ...(hasMatchLabels ? { matchLabels } : {}),
      ...(hasMatchExpressions ? { matchExpressions } : {}),
    };
  }

  private invalidDefaultSelector(group: string, resource: string): Error {
    const groupResource = group ? `${resource}.${group}` : resource;
    return new Error(
      `Invalid defaultSelector for permission claim ${groupResource}`,
    );
  }

  private sendReloadConfigCustomMessage(action: string, context: NodeContext) {
    const entityType = context.entityType ? context.entityType : '';

    this.luigiClient.sendCustomMessage({
      origin: 'Marketplace',
      action,
      id: 'openmfp.reload-luigi-config',
      entity: entityType,
      context: {
        [entityType]: context.entityName,
        accountPath: context.accountPath,
        user: context.userId,
      },
    });
  }
}
