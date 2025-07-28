import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { ButtonBarComponent } from '@fundamental-ngx/core/bar';
import { CheckboxComponent } from '@fundamental-ngx/core/checkbox';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import {
  ListBylineDirective,
  ListComponent,
  ListContentDirective,
  ListItemComponent,
  ListThumbnailDirective,
  ListTitleDirective,
} from '@fundamental-ngx/core/list';
import {
  MessageBoxBodyComponent,
  MessageBoxComponent,
  MessageBoxFooterComponent,
  MessageBoxHeaderComponent,
  MessageBoxRef,
} from '@fundamental-ngx/core/message-box';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { Store } from '@ngrx/store';
import { Account, AccountNamingConfig } from 'models/index';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import { setDefaultAccount } from 'state/accounts.action';

@Component({
  selector: 'app-edit-account',
  imports: [
    MessageBoxComponent,
    MessageBoxHeaderComponent,
    TitleComponent,
    MessageBoxBodyComponent,
    ListComponent,
    ListItemComponent,
    ListThumbnailDirective,
    AvatarComponent,
    ListContentDirective,
    ListTitleDirective,
    ListBylineDirective,
    CheckboxComponent,
    FormsModule,
    FormLabelComponent,
    MessageBoxFooterComponent,
    ButtonBarComponent,
  ],
  templateUrl: './edit-account.component.html',
  styleUrl: './edit-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAccountComponent {
  public setDefault: boolean;
  public account: Account;

  constructor(
    public messageBoxRef: MessageBoxRef<Account>,
    private store: Store,
    private accountNamingService: AccountNamingService,
  ) {
    this.account = this.messageBoxRef.data;
    this.setDefault = this.accountIsDefault();
  }

  edit() {
    if (!this.accountIsDefault() && this.setDefault) {
      this.store.dispatch(setDefaultAccount({ id: this.account.id }));
    }
    this.messageBoxRef.close();
  }

  cancel() {
    this.messageBoxRef.close();
  }

  accountIsDefault(): boolean {
    return this.account.type?.defaultAccount?.id == this.account.id;
  }

  get accountNamingConfig(): Signal<AccountNamingConfig> {
    return this.accountNamingService.accountNamingConfig;
  }

  get accountNamingConfigLowerCase(): Signal<AccountNamingConfig> {
    return this.accountNamingService.accountNamingConfigLowerCase;
  }
}
