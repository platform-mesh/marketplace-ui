import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AuthorizationModule } from '@dxp/ngx-core/authorization';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import {
  ColumnType,
  DxpTableGeneratorModule,
  ActionConfig as TableGeneratorActionConfig,
  ColumnConfig as TableGeneratorColumnConfig,
  TableConfig as TableGeneratorConfig,
  LinkConfig as TableGeneratorLinkConfig,
  TableItemType,
  ToolbarActionConfig,
} from '@dxp/ngx-core/table-generator';
import {
  IllustratedMessageActionsComponent,
  IllustratedMessageComponent,
  IllustratedMessageFigcaptionComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core/illustrated-message';
import { ButtonComponent } from '@fundamental-ngx/platform/button';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { CustomResource } from 'models/custom.resource';
import {
  ConfirmationDialogDecision,
  DeleteActionDetails,
  EditActionDetails,
  GlobalAddActionDetails,
} from 'models/dialog';
import {
  AccountConnection,
  ActionConfig,
  ActionsConfig,
  ColumnConfig,
  GlobalAccountActionConfig,
  LinkConfig,
  TableConfig,
} from 'models/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JsonataEvaluator } from 'shared/jsonata-evaluator';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  deleteAccountResource,
  openAccountResourceCreationDialog,
  openAccountResourceCustomActionDialog,
  openAccountResourceEditDialog,
  patchAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import { loadAccountResourcesOfAccount } from 'state/account-resources/account-resources-read.action';
import { customResourceOfCurrentAccount } from 'state/account-resources/account-resources.selectors';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import { hasPolicy } from 'state/luigi.selectors';
import { ProviderState } from 'state/providerState';

@Component({
  selector: 'app-provider-account-resources',
  imports: [
    DxpTableGeneratorModule,
    IllustratedMessageComponent,
    IllustratedMessageFigcaptionComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageTextDirective,
    IllustratedMessageActionsComponent,
    AuthorizationModule,
    ButtonComponent,
    AsyncPipe,
  ],
  templateUrl: './provider-account-resources.component.html',
  styleUrl: './provider-account-resources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderAccountResourcesComponent implements OnInit, OnDestroy {
  @Input() accountConnection?: AccountConnection;
  tableConfig: TableGeneratorConfig = { columns: [] };
  data: TableItemType[] | undefined;
  protected readonly marketplaceEntry = this.store.select(
    selectSelectedProvider,
  );
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private store: Store<ProviderState>,
    private LuigiClient: LuigiClient,
    private accountNamingService: AccountNamingService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  spotConfig = {
    spot: {
      url: 'assets/images/sapIllus-Spot-NoEntries.svg',
      id: 'sapIllus-Spot-NoEntries',
    },
  };
  ngOnInit() {
    this.accountNamingService.updateAccountNamingConfig(
      this.accountConnection?.type.apiResourceConfig.displayConfig
        .accountNamingConfig,
    );

    this.store
      .select(hasPolicy('iamMember'))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isReader) => {
        if (!isReader) {
          return;
        }
        this.store.dispatch(
          loadAccountResourcesOfAccount({
            accountConnection: this.accountConnection,
          }),
        );
      });

    this.store
      .select(customResourceOfCurrentAccount)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((resources) => {
        this.initializeTable(resources);
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private addDefaultActions(
    tableConfig: TableGeneratorConfig,
    cfg: ActionsConfig,
  ) {
    const editAction = cfg?.additionalActions?.find(
      (action) => action.id === EditActionDetails.id,
    );
    tableConfig.actions?.push(this.overrideEditAction(editAction));

    const deleteAction = cfg?.additionalActions?.find(
      (action) => action.id === DeleteActionDetails.id,
    );
    tableConfig.actions?.push(this.overrideDeleteAction(deleteAction));
  }

  private addActions(
    tableConfig: TableGeneratorConfig,
    actions: ActionsConfig,
  ) {
    actions?.additionalActions
      .filter(
        (action) =>
          action.id !== EditActionDetails.id &&
          action.id !== DeleteActionDetails.id,
      )
      .forEach((action) => {
        const actionConfig: TableGeneratorActionConfig = {
          id: action.id,
          glyph: action.glyph,
          label: action.displayName,
          condition: action.condition,
          requiredPolicies: action.requiredPolicies || [],
          callback: (item: TableItemType) => {
            const actionFunction = () => {
              this.store.dispatch(
                patchAccountResource({
                  accountConnection: this.accountConnection!,
                  resourceName: item.metadataName as string,
                  payload: action.executionPayload?.payload || '',
                  successMessage: action.actionSuccessMessage,
                }),
              );
            };
            if (action.confirmationPopup) {
              const settings: ConfirmationModalSettings = {
                type: action.confirmationPopup.type,
                header: action.confirmationPopup.title,
                body: JsonataEvaluator.evaluateParameter(
                  action.confirmationPopup.text,
                  item,
                ) as string,
                buttonConfirm: action.confirmationPopup.acceptButton,
                buttonDismiss: action.confirmationPopup.cancelButton,
              };
              this.openConfirmationDialog(settings, actionFunction);
            } else {
              actionFunction();
            }
          },
        };
        tableConfig.actions?.push(actionConfig);
      });
  }

  private overrideEditAction(
    cfgOverrides: ActionConfig | undefined,
  ): TableGeneratorActionConfig {
    const action: TableGeneratorActionConfig = {
      id: EditActionDetails.id,
      glyph: EditActionDetails.glyph,
      label: EditActionDetails.label,
      requiredPolicies: ['projectAdmin'],
      callback: (item: TableItemType) => {
        this.store.dispatch(
          openAccountResourceEditDialog({
            resourceName: item.metadataName as string,
            accountConnection: this.accountConnection!,
          }),
        );
      },
    };
    return Object.assign(action, cfgOverrides);
  }
  private overrideDeleteAction(
    cfgOverrides: ActionConfig | undefined,
  ): TableGeneratorActionConfig {
    const deleteAction: TableGeneratorActionConfig = {
      id: DeleteActionDetails.id,
      glyph: DeleteActionDetails.glyph,
      label: DeleteActionDetails.label,
      requiredPolicies: ['projectAdmin'],
      callback: (item: TableItemType) => {
        const settings: ConfirmationModalSettings = {
          type: cfgOverrides?.confirmationPopup?.type || 'warning',
          header:
            cfgOverrides?.confirmationPopup?.title || DeleteActionDetails.label,
          body:
            (JsonataEvaluator.evaluateParameter(
              cfgOverrides?.confirmationPopup?.text || '',
              item,
            ) as string) || `Delete instance <b>${item.metadataName}</b>?`,
          buttonConfirm:
            cfgOverrides?.confirmationPopup?.acceptButton ||
            DeleteActionDetails.label,
          buttonDismiss:
            cfgOverrides?.confirmationPopup?.cancelButton || 'Cancel',
        };
        const actionFunction = () => {
          this.store.dispatch(
            deleteAccountResource({
              name: item.metadataName as string,
              accountConnection: this.accountConnection!,
              successMessage: cfgOverrides?.actionSuccessMessage,
            }),
          );
        };
        this.openConfirmationDialog(settings, actionFunction);
      },
    };
    return Object.assign(deleteAction, cfgOverrides);
  }

  private initializeTable(resources: CustomResource[]) {
    if (this.accountConnection) {
      this.tableConfig = this.mapApiResourceTableConfig(
        this.accountConnection.type.apiResourceConfig.displayConfig.tableConfig,
      );

      const accountResourceDefinedActions =
        this.accountConnection.type.apiResourceConfig.displayConfig.tableConfig
          .actions;

      if (accountResourceDefinedActions) {
        this.addActions(this.tableConfig, accountResourceDefinedActions);
        this.addDefaultActions(this.tableConfig, accountResourceDefinedActions);
      }
      // Delete and edit are default actions which are present for every extension
      this.data = this.mapApiResourceTableData(
        resources,
        this.accountConnection?.type?.apiResourceConfig?.displayConfig
          .tableConfig,
      );
    }
  }

  mapApiResourceTableData(
    resources: CustomResource[],
    tableConfig: TableConfig,
  ): TableItemType[] {
    return resources.map((resource) =>
      this.mapApiResource(resource, tableConfig),
    );
  }

  private mapApiResource(
    resource: CustomResource,
    tableConfig: TableConfig | undefined,
  ): TableItemType {
    if (!tableConfig) {
      return {};
    }
    return tableConfig.columns.reduce(
      (obj, column) => {
        const key = this.generateObjectKey(column.dataPath);
        obj[key] = this.getValueByKeyString(resource, column.dataPath);

        if (column.status?.tooltipDataPath) {
          const columnTooltipDataPath = this.generateObjectKey(
            column.status.tooltipDataPath,
          );
          obj[columnTooltipDataPath] =
            this.getValueByKeyString(resource, column.status.tooltipDataPath) ||
            column.status.tooltipDefaultMessage;
        }

        obj = this.ensureMetadataName(obj, resource);
        return this.enrichWithLink(resource, column?.link, key, obj);
      },
      {} as Record<string, unknown>,
    );
  }

  private ensureMetadataName(
    tableItem: TableItemType,
    resource: CustomResource,
  ): TableItemType {
    if (!tableItem.metadataName) {
      tableItem.metadataName = resource.metadata.name;
    }
    return tableItem;
  }

  private enrichWithLink(
    resource: CustomResource,
    columnLink: LinkConfig | undefined,
    columnKey: string,
    tableItem: TableItemType,
  ): TableItemType {
    if (!columnLink) {
      return tableItem;
    }

    const urlValue = columnLink.url?.length
      ? columnLink.url
      : (this.getValueByKeyString(
          resource,
          columnLink.urlPath || '',
        ) as string);
    const linkFields: Record<string, unknown> = {};
    linkFields[`${columnKey}UrlTarget`] = columnLink.target || '_blank';
    linkFields[`${columnKey}Url`] = urlValue;
    return { ...tableItem, ...linkFields };
  }

  private getValueByKeyString(
    customResource: CustomResource,
    dataPath: string,
  ): unknown {
    if (!dataPath) {
      return '';
    }

    if (customResource === undefined || customResource === null) {
      return;
    }

    const cleanedPath = dataPath.startsWith('.') ? dataPath.slice(1) : dataPath;
    const keys = cleanedPath.split('.');
    let value: unknown = customResource;

    for (const key of keys) {
      value = (value as Record<string, unknown>)[key];
      if (value === undefined || value === null) {
        return;
      }
    }
    return value as unknown;
  }

  mapApiResourceTableConfig(tableConfig: TableConfig): TableGeneratorConfig {
    return {
      toolbar: {
        title: this.accountNamingService.accountNamingConfig().plural,
        actions: this.mapToolbarActions(tableConfig),
      },
      actions: [],
      columns: this.mapColumnsConfig(tableConfig.columns),
    };
  }

  protected get accountNamingArticle() {
    if (/^[aeiouAEIOU]/.test(this.accountNamingConfigLowercase.singular)) {
      return `an`;
    } else {
      return `a`;
    }
  }

  protected get accountNamingConfigLowercase() {
    return this.accountNamingService.accountNamingConfigLowerCase();
  }

  protected get accountNamingConfig() {
    return this.accountNamingService.accountNamingConfig();
  }

  private addDefaultToolbarActions(
    tableConfig: TableConfig,
  ): ToolbarActionConfig[] {
    const toolbarActions: ToolbarActionConfig[] = [];
    //Add is the default action
    const addAction = tableConfig.actions?.globalActions?.find(
      (action) => action.id === GlobalAddActionDetails.id,
    );

    const dialogTitle = addAction?.displayName || 'Add';

    let defaultAddAction: ToolbarActionConfig = {
      id: GlobalAddActionDetails.id,
      label: GlobalAddActionDetails.label,
      transparentButton: false,
      requiredPolicies: ['projectAdmin'],
      callback: () => {
        this.store.dispatch(
          openAccountResourceCreationDialog({
            accountConnection: this.accountConnection,
            dialogTitle: dialogTitle,
          }),
        );
      },
    };

    if (!addAction) {
      return [defaultAddAction];
    }

    defaultAddAction = Object.assign(
      defaultAddAction,
      this.convertToToolbarAction(addAction, false),
    );
    toolbarActions.push(defaultAddAction);

    return toolbarActions;
  }

  private convertToToolbarAction(
    action: GlobalAccountActionConfig,
    actionTransparentButton = false,
  ): ToolbarActionConfig {
    const toolbarAction: ToolbarActionConfig = {
      id: action.id,
      label: action.displayName,
      glyph: action.glyph,
      condition: action.condition,
      transparentButton: actionTransparentButton,
      requiredPolicies: action.requiredPolicies || [],
    };

    if (action.actionConfig?.path) {
      toolbarAction.callback = () => {
        this.store.dispatch(
          openAccountResourceCustomActionDialog({
            globalAccountActionConfig: action,
            accountConnection: this.accountConnection,
          }),
        );
      };
    }
    return toolbarAction;
  }

  private mapToolbarActions(tableConfig: TableConfig): ToolbarActionConfig[] {
    const toolbarActions = this.addDefaultToolbarActions(tableConfig);

    tableConfig.actions?.globalActions
      ?.filter((action) => action.id !== GlobalAddActionDetails.id)
      .forEach((action) => {
        toolbarActions.push(this.convertToToolbarAction(action, true));
      });
    return toolbarActions;
  }

  private openConfirmationDialog(
    settings: ConfirmationModalSettings,
    onActionSuccessCallback: (item?: TableItemType) => void,
  ): void {
    void this.showConfirmationModal(settings).then((value) => {
      if (value === ConfirmationDialogDecision.CONFIRMED) {
        onActionSuccessCallback();
      }
    });
  }

  private showConfirmationModal(
    settings: ConfirmationModalSettings,
  ): Promise<ConfirmationDialogDecision> {
    return this.LuigiClient.uxManager()
      .showConfirmationModal(settings)
      .then(() => Promise.resolve(ConfirmationDialogDecision.CONFIRMED))
      .catch(() => Promise.resolve(ConfirmationDialogDecision.DISMISSED));
  }

  private mapColumnsConfig(
    columns: ColumnConfig[],
  ): TableGeneratorColumnConfig[] {
    return columns.map((column) => ({
      name: column.name,
      label: column.label,
      key: this.generateObjectKey(column.dataPath),
      type: this.mapTypeConfig(column),
      link: this.mapLinkConfig(column),
      hidden: column.hidden,
      status: column.status,
      statusTooltipKey: this.generateObjectKey(
        column.status?.tooltipDataPath || '',
      ),
      textMapping: column.textMapping,
      popIn: column.popIn,
    }));
  }

  private mapTypeConfig(column: ColumnConfig): ColumnType {
    if (column.link) {
      return ColumnType.LINK;
    }
    if (column.tags) {
      return ColumnType.TAGS;
    }
    if (column.status) {
      return ColumnType.STATUS;
    }
    return ColumnType.TEXT;
  }

  private mapLinkConfig(
    column: ColumnConfig,
  ): TableGeneratorLinkConfig | undefined {
    if (column.link) {
      const columnKey = this.generateObjectKey(column.dataPath);
      return {
        target: `${columnKey}UrlTarget`,
        url: `${columnKey}Url`,
      };
    }
    return undefined;
  }

  generateObjectKey(dataPath: string): string {
    if (!dataPath) {
      return '';
    }

    const cleanedPath = dataPath.startsWith('.') ? dataPath.slice(1) : dataPath;
    const keys = cleanedPath.split('.');
    const capitalizedKeys = keys.map((key, idx) =>
      idx === 0
        ? key.toLowerCase()
        : key.charAt(0).toUpperCase() + key.slice(1),
    );
    return capitalizedKeys.join('');
  }

  toolbarActionCallback($event: MouseEvent, actionConfig: ToolbarActionConfig) {
    actionConfig.callback?.();
    $event.stopPropagation();
  }
}
