import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DxpWizardComponent,
  RunParameter,
  WizardDefinition,
} from '@dxp/ngx-core/wizard';
import LuigiClient from '@luigi-project/client';
import { Store } from '@ngrx/store';
import { ProviderWizardConfig } from 'models/index';
import { Subject, combineLatestWith, takeUntil } from 'rxjs';
import { BtpSecretService } from 'services/btp-secret-service';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';
import { creditDialogOpened } from 'state/btp-account/btp-account.action';
import { selectProviderMetadata } from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';
import YAML from 'yaml';

@Component({
  selector: 'app-btp-account-cr-edit',
  imports: [DxpWizardComponent],
  templateUrl: './btp-account-cr-edit.component.html',
  styleUrl: './btp-account-cr-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BtpAccountCrEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  protected wizardConfig: ProviderWizardConfig | undefined;
  protected wizardDefinition: WizardDefinition | undefined;
  private interval: string | number | NodeJS.Timeout | undefined;

  constructor(
    private store: Store<ProviderState>,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private secretService: BtpSecretService,
  ) {
    this.interval = 0;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe), combineLatestWith(this.route.data))
      .subscribe(([params, data]) => {
        const creditDialogType = data.dialogType as CreditDialogType;
        this.store.dispatch(
          creditDialogOpened({
            providerName: params['providerName'] as string,
            extClassScope: params['scope'] as string,
            dialogType: creditDialogType,
          }),
        );
      });

    this.interval = setInterval(() => {
      const querySelector = document.querySelectorAll('input');
      querySelector[3]?.setAttribute('type', 'password');
      querySelector[4]?.setAttribute('type', 'password');
    });

    this.store.select(selectProviderMetadata).subscribe((extClass) => {
      if (!extClass) {
        return;
      }

      const wizardConfig =
        extClass?.accountConnections?.[0].type.apiResourceConfig.wizardConfig;
      this.wizardConfig = wizardConfig;
      this.wizardDefinition = YAML.parse(
        wizardConfig?.wizardDefinition ?? '',
      ) as WizardDefinition;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    clearInterval(this.interval);

    this.ngUnsubscribe.complete();
  }

  wizardCanceled() {
    LuigiClient.linkManager().goBack(true);
    console.log('Wizard canceled');
  }

  finish($event: RunParameter[]) {
    const projectId = 'devx-hackathon-demo';
    let vaultPath;
    const data = [];

    for (const param of $event) {
      if (param.value) {
        if (param.name === 'secretName') {
          vaultPath = param.value;
        } else {
          data.push({
            key: param.name,
            value: param.value,
          });
        }
      }
    }
    this.secretService.writeSecret(projectId, vaultPath, data).subscribe(() => {
      console.log('Secret written successfully');
      LuigiClient.linkManager().goBack(true);
    });
  }

  wizardError($event: Error) {
    console.log('Wizard error', $event);
  }
}
