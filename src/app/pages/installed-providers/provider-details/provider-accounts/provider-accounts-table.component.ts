import { BtpAccountTableComponent } from '../btp-account-table/btp-account-table.component';
import { ProviderAccountResourcesComponent } from '../provider-account-resources/provider-account-resources.component';
import { EditAccountComponent } from './edit-account/edit-account.component';
import {
  MessageBoxData,
  RemoveAccountConfirmationComponent,
} from './remove-account-confirmation/remove-account-confirmation.component';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Signal,
  effect,
  input,
} from '@angular/core';
import { AuthorizationModule } from '@dxp/ngx-core/authorization';
import { GithubRegistration, GithubService } from '@dxp/ngx-core/github';
import {
  StatusInfo,
  StatusInfoPopoverComponent,
} from '@dxp/ngx-core/status-info-popover';
import { LinkModule, MessageBoxService } from '@fundamental-ngx/core';
import { ButtonComponent } from '@fundamental-ngx/core/button';
import {
  IllustratedMessageActionsComponent,
  IllustratedMessageComponent,
  IllustratedMessageFigcaptionComponent,
  IllustratedMessageModule,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core/illustrated-message';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { MessageStripComponent } from '@fundamental-ngx/core/message-strip';
import {
  FdpTableCell,
  NoDataWrapperComponent,
  PlatformTableModule,
  TableColumnComponent,
  TableComponent,
  TableToolbarActionsComponent,
  TableToolbarComponent,
} from '@fundamental-ngx/platform/table';
import { TableInitialStateDirective } from '@fundamental-ngx/platform/table-helpers';
import { Store } from '@ngrx/store';
import {
  Account,
  AccountConnection,
  AccountNamingConfig,
  AccountType,
  MarketplaceEntry,
  MessageStripConfig,
} from 'models/provider-metadata';
import { Observable, Subject, map } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BtpSecretService } from 'services/btp-secret-service';
import { ProviderService } from 'services/provider.service';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import { openAccountResourceCreationDialog } from 'state/account-resources/account-resources-edit.action';
import { customResourceOfCurrentAccount } from 'state/account-resources/account-resources.selectors';
import { selectAccountsPerConnectionTypes } from 'state/accounts.selectors';
import { ProviderState } from 'state/providerState';

@Component({
  selector: 'app-provider-account-table',
  imports: [
    TableComponent,
    TableToolbarComponent,
    IllustratedMessageModule,
    TableToolbarActionsComponent,
    PlatformTableModule,
    MessageStripComponent,
    ProviderAccountResourcesComponent,
    IllustratedMessageComponent,
    TableInitialStateDirective,
    IllustratedMessageFigcaptionComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageTextDirective,
    AuthorizationModule,
    IllustratedMessageActionsComponent,
    StatusInfoPopoverComponent,
    TableColumnComponent,
    NoDataWrapperComponent,
    FdpTableCell,
    LinkModule,
    InfoLabelComponent,
    ButtonComponent,
    AsyncPipe,
    BtpAccountTableComponent,
  ],
  templateUrl: './provider-accounts-table.component.html',
  styleUrl: './provider-accounts-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderAccountsTableComponent implements OnInit, OnDestroy {
  marketplaceEntryInputSignal = input.required<MarketplaceEntry>();

  accountsPerType: Record<string, Account[]> = {};
  accountTypes: Record<string, AccountType> = {};

  private ngUnsubscribe = new Subject<void>();
  protected limitedAccess: StatusInfo = {
    items: [
      {
        header: 'Limited Access',
        content:
          'The Hyperspace Portal GitHub app has limited repository access (“Only Select Repositories”) which can lead to unexpected behaviour. The GitHub organization owner can change repository access to “All Repositories” in GitHub configuration to enable full functionality.',
        status: 'critical',
        glyph: 'warning',
      },
    ],
  };

  protected spotConfig = {
    spot: {
      url: 'assets/images/tnt-Spot-NoApplications.svg',
      id: 'tnt-Spot-NoApplications',
    },
  };
  protected githubRegistrations: Observable<GithubRegistration[]> | undefined;

  public accountHasCustomResources: Observable<boolean>;

  constructor(
    private providerService: ProviderService,
    private githubService: GithubService,
    private btpSecretService: BtpSecretService,
    private store: Store<ProviderState>,
    private cd: ChangeDetectorRef,
    private messageBoxService: MessageBoxService,
    private accountNamingService: AccountNamingService,
  ) {
    effect(() => {
      if (
        this.marketplaceEntryInputSignal().metadata.name === 'dxp-github-ui'
      ) {
        this.accountNamingService.updateAccountNamingConfig({
          singular: 'Organization',
          plural: 'Organizations',
        });
      }
    });

    this.accountHasCustomResources = this.store
      .select(customResourceOfCurrentAccount)
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(map((resources) => !!resources.length));
  }

  ngOnInit(): void {
    if (
      this.marketplaceEntryInputSignal().metadata.name === 'dxp-btp-accounts-ui'
    ) {
      this.btpSecretService
        .getBTPSecrets()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (secrets) => {
            const accounts = secrets
              .filter((secret) =>
                secret.path.startsWith(this.btpSecretService.BTPPREFIX),
              )
              .map((secret) =>
                secret.path.replace(this.btpSecretService.BTPPREFIX, ''),
              )
              .map((secretPath) =>
                this.btpSecretService.createBTPAccount(
                  secretPath,
                  this.marketplaceEntryInputSignal().metadata.name,
                ),
              );
            accounts.forEach((account) => {
              this.accountTypes[account.type.id] = account.type;
            });
            this.accountsPerType = accounts.reduce(
              (result, account) => {
                if (!account.type) {
                  return result;
                }
                if (!result[account.type.id]) {
                  result[account.type.id] = [];
                  this.accountTypes[account.type.id] = account.type;
                }
                result[account.type.id].push(account);
                return result;
              },
              {} as Record<string, Account[]>,
            );
            this.cd.detectChanges();
          },
        });
    } else {
      this.store
        .select(selectAccountsPerConnectionTypes)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (accounts) => {
            this.accountsPerType = accounts.reduce(
              (result, account) => {
                if (!account.type) {
                  return result;
                }
                if (!result[account.type.id]) {
                  result[account.type.id] = [];
                  this.accountTypes[account.type.id] = account.type;
                }
                result[account.type.id].push(account);
                return result;
              },
              {} as Record<string, Account[]>,
            );
            this.cd.detectChanges();
          },
        });
    }

    if (this.marketplaceEntryInputSignal().metadata.name === 'dxp-github-ui') {
      this.githubRegistrations = this.githubService
        .getGithubAppRegistrations<GithubRegistration[]>()
        .pipe(takeUntil(this.ngUnsubscribe));
    }
  }

  get accountNamingConfig(): Signal<AccountNamingConfig> {
    return this.accountNamingService.accountNamingConfig;
  }

  get accountNamingConfigLowerCase(): Signal<AccountNamingConfig> {
    return this.accountNamingService.accountNamingConfigLowerCase;
  }

  installationHasSelectedRepositories(
    githubRegistrations: GithubRegistration[],
    githubDomain: string,
    organizationName: string,
  ): boolean {
    return !!githubRegistrations.find((registration) => {
      return (
        registration.installation?.account?.login === organizationName &&
        registration.installation.account?.domain === githubDomain &&
        registration.installation.repository_selection === 'selected'
      );
    });
  }

  showIssuesColumn(githubRegistrations: GithubRegistration[]): boolean {
    return !!githubRegistrations?.find(
      (registration) =>
        registration?.installation?.repository_selection === 'selected',
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async addAccount(account: AccountConnection | undefined): Promise<void> {
    const findAccountConnection = this.findAccountConnection();
    if (this.hasApiResourcesAccConnectionType() && findAccountConnection) {
      this.store.dispatch(
        openAccountResourceCreationDialog({
          accountConnection: findAccountConnection,
        }),
      );
      return;
    }

    if (!account) {
      throw new Error('AccountConnection is required');
    }

    await this.providerService.openDialogForAddAccountType(account);
  }

  getAccountConnections(): AccountConnection[] {
    return (
      this.marketplaceEntryInputSignal().spec.providerMetadata.spec.accountConnections?.filter(
        (acc) => !!acc.type?.apiResourceConfig,
      ) ?? []
    );
  }

  hasApiResourcesAccConnectionType(): boolean {
    return !!this.marketplaceEntryInputSignal().spec.providerMetadata.spec.accountConnections?.some(
      (acc) => !!acc.type?.apiResourceConfig,
    );
  }

  getAccountMessageStrips(
    apiResourceConfig: AccountConnection,
  ): MessageStripConfig[] {
    return (
      apiResourceConfig.type.apiResourceConfig.displayConfig.tableConfig
        ?.messageStrip ?? []
    );
  }

  showAddAccountMessage(accountHasCustomResources: boolean): boolean {
    return (
      this.hasNoAccountsAdded() &&
      (!this.hasApiResourcesAccConnectionType() || !accountHasCustomResources)
    );
  }

  hasNoAccountsAdded(): boolean {
    return Object.keys(this.accountsPerType).length === 0;
  }

  getAccountGroups(): string[] {
    return Object.keys(this.accountsPerType);
  }

  openLink(account: Account): void {
    window.open(account.link, '_blank');
  }

  removeAccount(account: Account) {
    const type = account.type.id;
    if (!type) {
      console.warn('Account type is missing');
      return;
    }
    this.messageBoxService.open(RemoveAccountConfirmationComponent, {
      showSemanticIcon: true,
      type: 'warning',
      data: {
        currentAccount: account,
        allAccounts: this.accountsPerType[type],
      } as MessageBoxData,
      width: '28rem',
    });
  }

  editAccount(account: Account) {
    this.messageBoxService.open(EditAccountComponent, {
      showSemanticIcon: true,
      data: account,
      width: '28rem',
    });
  }

  findAccountConnection(): AccountConnection | undefined {
    return this.marketplaceEntryInputSignal().spec.providerMetadata.spec.accountConnections?.find(
      (acc) => !!acc.type?.apiResourceConfig,
    );
  }
}
