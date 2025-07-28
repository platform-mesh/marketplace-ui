import { AccountNamingService } from './account-naming.service';
import { TestBed } from '@angular/core/testing';
import { AccountNamingConfig } from 'models/index';

describe('AccountNamingService', () => {
  let service: AccountNamingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountNamingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default account naming config', () => {
    expect(service.accountNamingConfig()).toEqual({
      singular: 'Account',
      plural: 'Accounts',
    });
  });

  it('should update account naming config and capitalize values', () => {
    const newConfig: AccountNamingConfig = {
      singular: 'account',
      plural: 'accounts',
    };

    service.updateAccountNamingConfig(newConfig);

    expect(service.accountNamingConfig()).toEqual({
      singular: 'Account',
      plural: 'Accounts',
    });
  });

  it('should return singular account naming', () => {
    expect(service.accountNamingConfig().singular).toBe('Account');
  });

  it('should return plural account naming', () => {
    expect(service.accountNamingConfig().plural).toBe('Accounts');
  });

  it('should not update config if singular or plural is missing', () => {
    const originalConfig = service.accountNamingConfig();

    service.updateAccountNamingConfig({
      singular: 'Team',
      plural: '',
    } as AccountNamingConfig);

    expect(service.accountNamingConfig()).toEqual(originalConfig);
  });
});
