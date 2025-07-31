import { exts } from '../pages/installed-providers/catalog/installed-providers';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketplaceEntry } from 'models/index';
import {
  Account,
  InstallProviderInput,
  ProviderMetadataFilter,
  UpdateProviderInput,
} from 'models/provider-metadata';
import { Observable, combineLatest, of, switchMap } from 'rxjs';
import { filter, first, map, mergeMap } from 'rxjs/operators';
import { ApolloFactory } from 'services/apollo-factory';
import { luigiContextSelector } from 'services/luigi/state';
import { getMarketplaceEntriesQuery } from 'services/marketplace-graphql.queries';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private store = inject<Store>(Store);
  private apolloFactory = inject<ApolloFactory>(ApolloFactory);

  getMarketplaceEntry(
    providerName: string,
    extFilter: ProviderMetadataFilter,
  ): Observable<MarketplaceEntry> {
    // todo gkr
    return of(exts);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context]) => {
    //     return apollo
    //       .query<{ getExtensionClassForScope: ProviderMetadata }>({
    //         query: extensionClassForScopeQuery,
    //         variables: {
    //           tenantId: context.tenantid,
    //           type: scope,
    //           context: GraphqlService.createGraphqlContextObject(context),
    //           providerName,
    //           filter: extFilter,
    //         },
    //         fetchPolicy: 'no-cache',
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) => apolloResponse.data.getExtensionClassForScope,
    //         ),
    //       );
    //   }),
    // );
  }

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
          .apollo(context)
          .query<{ getMarketplaceEntriesQuery: MarketplaceEntry[] }>({
            query: getMarketplaceEntriesQuery,
            variables: {
              filter: extFilter,
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map(
              (apolloResponse: any) =>
                apolloResponse.data.marketplace_platform_mesh_io
                  .MarketplaceEntries,
            ),
          );
      }),
    );
  }

  installProviderInstance(input: InstallProviderInput): Observable<unknown> {
    console.log('INSTALLED!!!!!');

    return of([]);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo.mutate({
    //       mutation: INSTALL_EXTENSION,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo?.scopeId,
    //         entity: scopeInfo?.scopeType.toLowerCase(),
    //         input,
    //       },
    //     });
    //   }),
    // );
  }

  unInstallExtension(name: string): Observable<unknown> {
    return of(true);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo.mutate({
    //       mutation: UNINSTALL_EXTENSION,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo?.scopeId,
    //         entity: scopeInfo?.scopeType.toLowerCase(),
    //         name: name,
    //       },
    //     });
    //   }),
    // );
  }

  updateProviderInstance(input: UpdateProviderInput): Observable<unknown> {
    return of(true);
    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     if (!scopeInfo || !input) {
    //       throw new Error('scopeInfo is undefined');
    //     }
    //     return apollo.mutate({
    //       mutation: UPDATE_EXTENSION_INSTANCE,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo.scopeId,
    //         entity: scopeInfo.scopeType.toLowerCase(),
    //         input,
    //       },
    //     });
    //   }),
    // );
  }

  public getAccounts(accountConnectionTypes: string[]): Observable<Account[]> {
    return of([]);

    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .query<{ accountConnectionsForScope: Account[] }>({
    //         query: ACCOUNT_CONNECTIONS,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           accountConnectionTypes,
    //         },
    //         fetchPolicy: 'no-cache',
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data.accountConnectionsForScope,
    //         ),
    //       );
    //   }),
    // );
  }

  public deleteAccountConnection(id: string): Observable<boolean> {
    return of(true);

    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .mutate<{ deleteAccountConnectionForScope: boolean }>({
    //         mutation: DELETE_ACCOUNT_CONNECTION,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           id,
    //         },
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data?.deleteAccountConnectionForScope ?? false,
    //         ),
    //       );
    //   }),
    // );
  }

  public setDefaultAccount(accountName: string): Observable<boolean> {
    return of(true);
    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .mutate<{ setDefaultAccount: boolean }>({
    //         mutation: SET_DEFAULT_ACCOUNT,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           accountName,
    //         },
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data?.setDefaultAccount ?? false,
    //         ),
    //       );
    //   }),
    // );
  }
}
