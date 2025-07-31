import {
  FetchJenkinsImportsResult,
  JenkinsImport,
  JenkinsImportResource,
} from './jenkins-imports-types';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageFooterComponent,
  DynamicPageHeaderComponent,
  MessageBoxService,
} from '@fundamental-ngx/core';
import { BarComponent, BarRightDirective } from '@fundamental-ngx/core/bar';
import { MessageStripComponent } from '@fundamental-ngx/core/message-strip';
import { TableRowSelectionChangeEvent } from '@fundamental-ngx/platform';
import { ButtonComponent } from '@fundamental-ngx/platform/button';
import { LinkComponent } from '@fundamental-ngx/platform/link';
import { ObjectStatusComponent } from '@fundamental-ngx/platform/object-status';
import {
  TableColumnComponent,
  TableComponent,
  TableToolbarComponent,
} from '@fundamental-ngx/platform/table';
import {
  FdpCellDef,
  FdpTableCell,
  TableInitialStateDirective,
} from '@fundamental-ngx/platform/table-helpers';
import { Store } from '@ngrx/store';
import axios from 'axios';
import { GoBackContext, LuigiGoBackAction } from 'models/luigi-go-back';
import { NodeContext } from 'models/node-context';
import { ScopeType } from 'models/provider-metadata';
import { Subscription, take } from 'rxjs';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { set } from 'shared/helpers';
import { createAccountResource } from 'state/account-resources/account-resources-edit.action';
import { resourceViewState } from 'state/account-resources/account-resources.selectors';
import { requestFailed } from 'state/common.action';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import { ProviderState } from 'state/providerState';

@Component({
  selector: 'app-import-accounts',
  imports: [
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageContentComponent,
    MessageStripComponent,
    LinkComponent,
    TableComponent,
    TableInitialStateDirective,
    TableToolbarComponent,
    TableColumnComponent,
    FdpCellDef,
    FdpTableCell,
    ObjectStatusComponent,
    DynamicPageFooterComponent,
    BarComponent,
    BarRightDirective,
    ButtonComponent,
  ],
  templateUrl: './import-accounts.component.html',
  styleUrl: './import-accounts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportAccountsComponent implements OnInit, OnDestroy {
  public data: JenkinsImport[] = [];
  public context: NodeContext | undefined;
  public selectedElements: JenkinsImport[] = [];

  constructor(
    private contextService: PmLuigiContextService,
    private cdr: ChangeDetectorRef,
    private luigiClient: LuigiClient,
    private store: Store<ProviderState>,
    private messageBoxService: MessageBoxService,
  ) {}

  private contextSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.contextSubscription = this.contextService
      .contextObservable()
      .subscribe((contextMessage) => {
        this.context = contextMessage.context;
        this.getUserAccounts(this.context);

        this.store.dispatch(
          loadProviderMetadata({
            providerName: this.context.providerName,
            installableIn: [ScopeType.PROJECT],
            includeHidden: false,
          }),
        );
        this.cdr.detectChanges();
      });
  }

  async fetchJenkinsImports(
    context: NodeContext,
    searchLabels?: Record<string, string>,
  ) {
    const automaticdRestApiUrl =
      context.serviceProviderConfig.automaticdRestApiUrl ||
      'https://automaticd.api.d1.hyperspace.tools.sap';

    let labelSearchFilter = '';
    if (searchLabels) {
      labelSearchFilter = Object.entries(searchLabels)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
    }

    const apiUrl = `${automaticdRestApiUrl}/apis/automaticd.sap/v1/namespaces/jenkinsimport/jenkinsimports?labelSelector=${labelSearchFilter}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${context.token}`,
        'Content-Type': 'application/json',
      },
    });

    const accountResources = response.data as FetchJenkinsImportsResult;

    return accountResources.items.map(
      (resource: JenkinsImportResource): JenkinsImport => {
        return {
          name: resource.metadata.name,
          imported: resource.metadata.labels.imported === 'true',
          projectId: resource.metadata.labels.projectId,
          ownerID: resource.metadata.labels.ownerID,
          costCenter: resource.spec.costcenter?.toString(),
          size: resource.spec.size.toLowerCase(),
        };
      },
    );
  }

  ngOnDestroy(): void {
    this.contextSubscription.unsubscribe();
  }

  getUserAccounts(context: NodeContext) {
    const searchByUserLabel: Record<string, string> = {
      ownerID: context.userid,
    };
    this.fetchJenkinsImports(context, searchByUserLabel)
      .then((fetchedData) => {
        fetchedData.map((el) => (el.selectable = !el.imported));
        this.data = fetchedData;
        this.cdr.detectChanges();
      })
      .catch((error: HttpErrorResponse) => {
        this.store.dispatch(
          requestFailed({
            goBack: true,
            error: error,
            dialogTitle: 'Error when retrieving accounts',
          }),
        );
      });
  }

  onRowSelectionChange(
    event: TableRowSelectionChangeEvent<JenkinsImport>,
  ): void {
    this.selectedElements = event.selection;
  }

  wizardCanceled() {
    this.luigiClient.linkManager().goBack({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_CANCEL,
    } as GoBackContext);
  }

  importAccounts() {
    this.store
      .select(resourceViewState)
      .pipe(take(1))
      .subscribe((resourceViewState) => {
        const ref = this.messageBoxService.open(
          {
            title: 'Confirm Jenkins Restart',
            content: `By importing the selected JaaS instance: ${this.selectedElements.map((x) => `'${x.name}'`).join(',')} will be restarted`,
            approveButton: 'Ok',
            approveButtonCallback: () => {
              this.selectedElements.forEach((element) => {
                this.store.dispatch(
                  createAccountResource({
                    metadata: { name: element.name },
                    spec: this.buildSpec(element),
                    marketplaceEntry: resourceViewState.marketplaceEntry,
                    accountConnection:
                      resourceViewState?.marketplaceEntry?.spec
                        ?.providerMetadata?.spec?.accountConnections?.[0],
                  }),
                );
              });
            },
            cancelButton: 'Cancel',
            cancelButtonCallback: function () {
              ref.close();
            },
          },
          {
            type: 'warning',
          },
        );
      });
  }

  private buildSpec(element: JenkinsImport): Record<string, object> {
    const result: Record<string, object> = {};
    set(result, 'size', element.size);
    set(result, 'costCenter', element.costCenter);
    set(result, 'owner', element.ownerID);

    return result;
  }
}
