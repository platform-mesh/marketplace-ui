import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DxpWizardModule,
  DxpWizardNavigationButtons,
  WizardConfigError,
} from '@dxp/ngx-core/fundamental-wizard-generator';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { DxpWizardComponent, RunParameter } from '@dxp/ngx-core/wizard';
import { Store } from '@ngrx/store';
import { GoBackContext, LuigiGoBackAction } from 'models/luigi-go-back';
import { WizardConfig } from 'models/wizard-configuration';
import {
  Observable,
  Subject,
  combineLatest,
  combineLatestWith,
  filter,
  map,
  take,
  takeUntil,
} from 'rxjs';
import { WizardConfigService } from 'services/wizard-config.service';
import { set } from 'shared/helpers';
import {
  createAccountResource,
  editAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import { accountResourceSelected } from 'state/account-resources/account-resources-read.action';
import {
  editResourceDefaultValues,
  editResourceWizardConfig,
  resourceViewState,
} from 'state/account-resources/account-resources.selectors';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';
import { ProviderState } from 'state/providerState';

@Component({
  selector: 'app-cr-edit-resource',
  imports: [DxpWizardModule, DxpWizardComponent, AsyncPipe],
  templateUrl: './cr-edit-resource.component.html',
  styleUrl: './cr-edit-resource.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrEditResourceComponent implements OnInit, OnDestroy {
  public wizardConfig: Observable<WizardConfig | undefined>;
  public wizardConfigDef: Observable<WizardConfig | undefined>;

  public defaultValues: Observable<Record<string, unknown> | undefined>;
  public navigationButtonLabels!: DxpWizardNavigationButtons;

  private ngUnsubscribe = new Subject<void>();
  private dialogType: CreditDialogType | undefined;

  constructor(
    private store: Store<ProviderState>,
    private luigiClient: LuigiClient,
    private route: ActivatedRoute,
    private wizardConfigService: WizardConfigService,
  ) {
    this.defaultValues = this.store
      .select(editResourceDefaultValues)
      .pipe(takeUntil(this.ngUnsubscribe));

    this.wizardConfigDef = this.store.select(editResourceWizardConfig).pipe(
      takeUntil(this.ngUnsubscribe),
      filter((wizardConfig): wizardConfig is WizardConfig => !!wizardConfig),
      map((wizardConfig) =>
        this.wizardConfigService.mapRequiredStepsToShowAsRequired(wizardConfig),
      ),
    );

    this.wizardConfig = combineLatest([
      this.defaultValues,
      this.wizardConfigDef,
    ]).pipe(
      map(([defaults, wizardConfig]) => {
        defaults = this.setDialogType(defaults);
        return this.wizardConfigService.setDefaultValues(
          defaults,
          wizardConfig,
        );
      }),
    );
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe), combineLatestWith(this.route.data))
      .subscribe(([params, data]) => {
        const creditDialogType = data.dialogType as CreditDialogType;
        this.navigationButtonLabels = {
          finish: {
            label:
              creditDialogType === CreditDialogType.EDIT ? 'Update' : 'Add',
          },
        };
        this.dialogType = creditDialogType;
        this.store.dispatch(
          accountResourceSelected({
            providerName: params['providerName'] as string,
            accountType: params['accountType'] as string,
            resourceNamespace: params['nspace'] as string,
            resourceName: params['name'] as string,
            dialogType: creditDialogType,
          }),
        );
      });
  }

  private setDialogType(
    defaults?: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!defaults) {
      defaults = { dialogType: this.dialogType };
    } else {
      defaults['dialogType'] = this.dialogType;
    }
    return defaults;
  }

  wizardError(wizardError: WizardConfigError | Error) {
    this.luigiClient.linkManager().goBack({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_ERROR,
      wizardConfigError: wizardError,
    } as GoBackContext);
  }

  // Old wizard
  wizardFinished(wizardValues: Record<string, string>): void {
    const wizValueResult = this.buildSpec(wizardValues);
    this.editAccount(wizValueResult.spec as Record<string, object>);
  }

  private editAccount(wizValueResult: Record<string, object>) {
    this.store
      .select(resourceViewState)
      .pipe(take(1))
      .subscribe((resourceViewState) => {
        if (this.dialogType === CreditDialogType.EDIT) {
          this.store.dispatch(
            editAccountResource({
              spec:
                (wizValueResult.spec as Record<string, object>) ||
                wizValueResult,
              marketplaceEntry: resourceViewState.marketplaceEntry,
              accountConnection: resourceViewState.accountConnection,
              resourceName: resourceViewState.accountResource.resourceName,
            }),
          );
        } else {
          this.store.dispatch(
            createAccountResource({
              metadata:
                (wizValueResult.metadata as Record<string, object>) || {},
              spec:
                (wizValueResult.spec as Record<string, object>) ||
                wizValueResult,
              marketplaceEntry: resourceViewState.marketplaceEntry,
              accountConnection: resourceViewState.accountConnection,
            }),
          );
        }
      });
  }

  buildSpec(wizardValues: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const propertyKey of Object.keys(wizardValues)) {
      set(result, propertyKey, wizardValues[propertyKey]);
    }

    return result;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();

    this.ngUnsubscribe.complete();
  }

  wizardCanceled(): void {
    this.luigiClient.linkManager().goBack({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_CANCEL,
    } as GoBackContext);
  }

  finish($event: RunParameter[]): void {
    const result: Record<string, object> = {};
    for (const param of $event) {
      set(result, param.name, param.value);
    }
    this.editAccount(result);
  }
}
