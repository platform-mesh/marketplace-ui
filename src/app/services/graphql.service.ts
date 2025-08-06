import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketplaceEntry } from 'models/index';
import {
  Account,
  ProviderMetadataFilter,
  UpdateProviderInput,
} from 'models/provider-metadata';
import { Observable, of, switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApolloFactory } from 'services/apollo-factory';
import { luigiContextSelector } from 'services/luigi/state';
import { createAPIBindingMutation, getMarketplaceEntriesQuery } from 'services/marketplace-graphql.queries';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private store = inject<Store>(Store);
  private apolloFactory = inject<ApolloFactory>(ApolloFactory);

  getMarketplaceEntry(
    providerName: string,
  ): Observable<MarketplaceEntry> {
    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) => {
        return this.apolloFactory
          .apollo(context)
          .query<{ getMarketplaceEntriesQuery: MarketplaceEntry[] }>({
            query: getMarketplaceEntriesQuery,
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map((apolloResponse: any) => {
              return apolloResponse.data.marketplace_platform_mesh_io.MarketplaceEntries;
            }),
            map((entries: MarketplaceEntry[]) => {
                const res = entries.filter(entry => {
                  return entry.metadata.name === providerName;
                });
                console.log(res);
                return res;
              },
            ),
            map((entries:MarketplaceEntry[])=> entries[0] || null)
          )
      }
    ))
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

  installProviderInstance(entry: MarketplaceEntry): Observable<unknown> {
    const name = entry.metadata.name;
    const metadata = JSON.parse(entry.spec.apiExport.metadata);
    const apiExportPath = metadata.annotations["kcp.io/path"]
    const apiExportName = name

    return this.store.select(luigiContextSelector).pipe(
      filter((x) => !!x),
      switchMap((context) =>
        this.apolloFactory
          .wsapollo(context)
          .mutate({
            mutation: createAPIBindingMutation,
            variables: {
              name: name,
              apiExportName: apiExportName,
              apiExportPath: apiExportPath,
            }})
      ));
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
