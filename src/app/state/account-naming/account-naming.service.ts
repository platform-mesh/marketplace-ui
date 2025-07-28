import { Injectable, computed, signal } from '@angular/core';
import { AccountNamingConfig } from 'models/index';
import { capitalize } from 'shared/helpers';

@Injectable({ providedIn: 'root' })
export class AccountNamingService {
  private _accountNamingConfig = signal<AccountNamingConfig>({
    singular: 'Account',
    plural: 'Accounts',
  });

  public accountNamingConfigLowerCase = computed(() => ({
    singular: this._accountNamingConfig().singular.toLowerCase(),
    plural: this._accountNamingConfig().plural.toLowerCase(),
  }));

  public accountNamingConfig = this._accountNamingConfig.asReadonly();

  updateAccountNamingConfig(config: AccountNamingConfig | undefined): void {
    if (!config || !config.singular || !config.plural) {
      this._accountNamingConfig.set({
        singular: 'Account',
        plural: 'Accounts',
      });
    } else {
      this._accountNamingConfig.set({
        singular: capitalize(config.singular),
        plural: capitalize(config.plural),
      });
    }
  }
}
