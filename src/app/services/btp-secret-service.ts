import { BTPApolloClientService } from './btp-apollo-client.service';
import { Injectable } from '@angular/core';
import { EntityScopeService } from '@dxp/ngx-core/entity-scope';
import { gql } from 'apollo-angular';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  first,
  map,
  mergeMap,
} from 'rxjs';

const BTP_PATH = 'btp-accounts';

interface SecretMetadata {
  scopes: string;
}

export interface Secret {
  path: string;
  metadata: SecretMetadata;
}

interface BTPSecretResponse {
  getPipelineSecrets: Secret[];
}

const GET_PIPELINE_SECRETS = gql`
  query ($projectId: String!, $componentId: String!) {
    getPipelineSecrets(projectId: $projectId, componentId: $componentId) {
      path
      metadata {
        scopes
      }
    }
  }
`;

const WRITE_SECRET = gql`
  mutation writeSecret(
    $projectId: String!
    $vaultPath: String!
    $data: [SecretData!]!
  ) {
    writeSecret(projectId: $projectId, vaultPath: $vaultPath, data: $data)
  }
`;

export interface SecretDataInput {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class BtpSecretService {
  // The GraphQL service only returns all flat entries of a project folder and doesn't search recursively
  BTPPREFIX = 'GROUP-SECRETS/btp-accounts-';

  constructor(
    private btpApolloClientService: BTPApolloClientService,
    private entityScopeService: EntityScopeService,
  ) {}

  public createBTPAccount = (path: string, project: string) => {
    return {
      id: 'btp',
      name: `id-${path}`,
      displayName: path,
      type: {
        id: 'btp',
        defaultAccount: undefined,
        displayName: 'BTP',
        description:
          'Integrates BTP to the Hyperspace Portal by enabling a User Interface to onboard your BTP Account.',
        image:
          'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        type: {
          Name: 'btp',
        },
      },
      subType: 'TBD',
      link: `https://github.tools.sap/${project}`,
      ref: '',
    };
  };

  public getBTPSecrets(): Observable<Secret[]> {
    return combineLatest([
      this.btpApolloClientService.apollo(),
      this.entityScopeService.getEntityAndScope(),
    ]).pipe(
      first(),
      mergeMap(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([apollo, { scope, entity }]) =>
          apollo.watchQuery<BTPSecretResponse>({
            query: GET_PIPELINE_SECRETS,
            variables: {
              projectId: scope,
              componentId: '',
            },
            pollInterval: 5000,
            fetchPolicy: 'no-cache',
          }).valueChanges,
      ),
      map((apolloResponse) => apolloResponse.data.getPipelineSecrets),
      distinctUntilChanged(),
    );
  }

  public writeSecret(
    projectId: string,
    vaultPath: string,
    data: SecretDataInput[],
  ): Observable<string> {
    const prefixedVaultPath = `GROUP-SECRETS/${BTP_PATH}-${vaultPath}`;
    return this.btpApolloClientService.apollo().pipe(
      first(),
      mergeMap((apollo) =>
        apollo
          .mutate<{ writeSecret: string }>({
            mutation: WRITE_SECRET,
            variables: {
              projectId,
              vaultPath: prefixedVaultPath,
              data,
            },
          })
          .pipe(map((res) => res.data?.writeSecret ?? '')),
      ),
    );
  }
}
