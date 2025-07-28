import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { FormStates } from '@fundamental-ngx/cdk/forms';
import { MessageBoxRef } from '@fundamental-ngx/core';
import { ButtonBarComponent } from '@fundamental-ngx/core/bar';
import {
  FormControlComponent,
  FormInputMessageGroupComponent,
  FormLabelComponent,
  FormMessageComponent,
} from '@fundamental-ngx/core/form';
import {
  MessageBoxBodyComponent,
  MessageBoxComponent,
  MessageBoxFooterComponent,
  MessageBoxHeaderComponent,
} from '@fundamental-ngx/core/message-box';
import { OptionComponent, SelectComponent } from '@fundamental-ngx/core/select';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { Store } from '@ngrx/store';
import { Account } from 'models/index';
import { triggerMatomoEvent } from 'shared/helpers';
import {
  removeAccount,
  removeAndSetDefaultAccount,
} from 'state/accounts.action';

export interface MessageBoxData {
  currentAccount: Account;
  allAccounts: Account[];
}

@Component({
  selector: 'app-remove-account-confirmation',
  imports: [
    MessageBoxComponent,
    MessageBoxHeaderComponent,
    TitleComponent,
    MessageBoxBodyComponent,
    FormLabelComponent,
    SelectComponent,
    FormsModule,
    ReactiveFormsModule,
    OptionComponent,
    FormInputMessageGroupComponent,
    FormControlComponent,
    FormMessageComponent,
    MessageBoxFooterComponent,
    ButtonBarComponent,
  ],
  templateUrl: './remove-account-confirmation.component.html',
  styleUrl: './remove-account-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveAccountConfirmationComponent {
  public account: Account;
  public allAccounts: Account[];
  public nextDefaultAccounts: Account[];
  public validate = false;
  defaultAccount = new FormControl<Account | null>(null, [Validators.required]);
  confirmationCheck = new FormControl('', [
    Validators.required,
    this.checkNameConfirmation.bind(this),
  ]);

  constructor(
    public messageBoxRef: MessageBoxRef<MessageBoxData>,
    private store: Store,
  ) {
    this.account = this.messageBoxRef.data.currentAccount;
    this.allAccounts = this.messageBoxRef.data.allAccounts;
    this.nextDefaultAccounts =
      this.allAccounts?.filter((a) => a.id !== this.account.id) || [];
  }

  remove() {
    this.validate = true;
    let selectedDefaultAccount = this.defaultAccount.value as Account;
    if (this.nextDefaultAccounts.length === 1) {
      selectedDefaultAccount = this.nextDefaultAccounts[0];
    }
    if (
      this.confirmationCheck.value != this.account.displayName ||
      (!selectedDefaultAccount &&
        this.accountIsDefault() &&
        this.nextDefaultAccounts.length > 0)
    ) {
      return;
    }

    if (selectedDefaultAccount) {
      this.store.dispatch(
        removeAndSetDefaultAccount({
          removeAccountId: this.account.id,
          newDefaultAccountId: selectedDefaultAccount.id,
        }),
      );
    } else {
      this.store.dispatch(removeAccount({ id: this.account.id }));
    }

    triggerMatomoEvent('deleteAccountResource', {
      extensionName: this.account.type.id,
    });

    this.messageBoxRef.close();
  }

  checkNameConfirmation(nameControl: AbstractControl): ValidationErrors | null {
    return !nameControl.touched ||
      nameControl.value == this.account?.displayName
      ? null
      : { nameNotMatching: true };
  }

  getState(fC: AbstractControl): FormStates {
    return this.validate && fC.invalid ? 'error' : 'default';
  }

  cancel() {
    this.messageBoxRef.close();
  }
  accountIsDefault(): boolean {
    return this.account.type?.defaultAccount?.id == this.account.id;
  }
}
