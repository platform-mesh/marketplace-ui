import { AccountNamingService } from './account-naming/account-naming.service';
import {
  accountAddedSuccess,
  accountRemovedSuccess,
  defaultAccountSetSuccess,
  readAccountsForAccountConnectionTypes,
  removeAccount,
  removeAndSetDefaultAccount,
  removeAndSetDefaultAccountSuccess,
  retrievedAccounts,
  setDefaultAccount,
} from './accounts.action';
import { AccountsEffects } from './accounts.effects';
import { selectDetailViewState } from './detail-view.selectors';
import { ProviderDetailState } from './provider-detail';
import { loadProviders } from './providers.actions';
import { selectAllProviders } from './providers.selectors';
import { fakeAsync } from '@angular/core/testing';
import { NotificationService } from '@dxp/ngx-core/notification';
import { TestUtils } from '@dxp/ngx-core/test';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { Account, ProviderMetadata } from 'models/index';
import { of, throwError } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';

describe('AccountsEffects', () => {
  const providers: ProviderMetadata[] = [
    {
      name: 'ext-class-1',
      accountConnections: [{ name: 't1' }, { name: 't2' }],
    } as ProviderMetadata,
  ];
  const accountConnectionTypes = { accountConnectionTypes: ['t1', 't2'] };

  const detailView: ProviderDetailState = {
    extension: 'ext-class-1',
  } as ProviderDetailState;

  let graphqlService: GraphqlService;
  let mockStore: MockStore;
  let notificationService: NotificationService;
  let accountNamingService: AccountNamingService;

  beforeEach(() => {
    graphqlService = mock<GraphqlService>();
    notificationService = mock<NotificationService>();
    mockStore = createMockStore({
      selectors: [
        {
          selector: selectAllProviders,
          value: providers,
        },
        {
          selector: selectDetailViewState,
          value: detailView,
        },
      ],
    });
    accountNamingService = new AccountNamingService();
    accountNamingService.updateAccountNamingConfig({
      singular: 'Account',
      plural: 'Accounts',
    });
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new AccountsEffects(
      new Actions(of(action)),
      mockStore,
      graphqlService,
      notificationService,
      accountNamingService,
    );
  }

  it('should issue an load extensions action and show message toast as a result of added accounts', fakeAsync(() => {
    // when
    const effects = createEffects(accountAddedSuccess());
    const action = TestUtils.getLastValue(effects.accountsModifiedEffect);

    // then
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'The account was added.',
    );
    expect(action).toEqual(loadProviders());
  }));

  it('should issue an load extensions action and show message toast as a result of removed accounts', fakeAsync(() => {
    // when
    const effects = createEffects(accountRemovedSuccess());
    const action = TestUtils.getLastValue(effects.accountsModifiedEffect);

    // then
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'Account was removed.',
    );
    expect(action).toEqual(loadProviders());
  }));

  it('should issue an load extensions action and show message toast as a result of setting of a default account', fakeAsync(() => {
    // when
    const effects = createEffects(defaultAccountSetSuccess());
    const action = TestUtils.getLastValue(effects.accountsModifiedEffect);

    // then
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'Account was set as default.',
    );
    expect(action).toEqual(loadProviders());
  }));

  it('should issue an load extensions action and show message toast as a result of removing default account and setting a new one as a default', fakeAsync(() => {
    // when
    const effects = createEffects(removeAndSetDefaultAccountSuccess());
    const action = TestUtils.getLastValue(effects.accountsModifiedEffect);

    // then
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'Account was removed. New default account is set.',
    );
    expect(action).toEqual(loadProviders());
  }));

  it('should load accounts for accounts connection types', fakeAsync(() => {
    // given
    const accounts: Account[] = [{ id: 'account-1' } as Account];
    graphqlService.getAccounts = jest.fn().mockReturnValue(of(accounts));

    // when
    const effects = createEffects(
      readAccountsForAccountConnectionTypes(accountConnectionTypes),
    );
    const action = TestUtils.getLastValue(
      effects.loadAccountConnectionTypesForProject,
    );

    // then
    expect(graphqlService.getAccounts).toHaveBeenCalledWith(
      accountConnectionTypes.accountConnectionTypes,
    );
    expect(action).toEqual(retrievedAccounts({ accounts }));
  }));

  it('should remove accounts', fakeAsync(() => {
    // given
    const id = 'abc-123';
    graphqlService.deleteAccountConnection = jest
      .fn()
      .mockReturnValue(of(true));

    // when
    const effects = createEffects(removeAccount({ id }));
    const action = TestUtils.getLastValue(effects.removeAccountEffect);

    // then
    expect(graphqlService.deleteAccountConnection).toHaveBeenCalledWith(id);
    expect(action).toEqual(accountRemovedSuccess());
  }));

  it('should catch error when removing accounts', fakeAsync(() => {
    // given
    const id = 'abc-123';
    graphqlService.deleteAccountConnection = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('Error removing account')));

    // when
    const effects = createEffects(removeAccount({ id }));
    const action = TestUtils.getLastValue(effects.removeAccountEffect);

    // then
    expect(graphqlService.deleteAccountConnection).toHaveBeenCalledWith(id);
    expect(action).toBeUndefined();
  }));

  it('should set default account', fakeAsync(() => {
    // given
    const id = 'abc-123';
    graphqlService.setDefaultAccount = jest.fn().mockReturnValue(of(true));

    // when
    const effects = createEffects(setDefaultAccount({ id }));
    const action = TestUtils.getLastValue(effects.setDefaultAccountEffect);

    // then
    expect(graphqlService.setDefaultAccount).toHaveBeenCalledWith(id);
    expect(action).toEqual(defaultAccountSetSuccess());
  }));

  it('should remove account and set a default one', fakeAsync(() => {
    // given
    const id = 'abc-123';
    graphqlService.setDefaultAccount = jest.fn().mockReturnValue(of(true));
    graphqlService.deleteAccountConnection = jest
      .fn()
      .mockReturnValue(of(true));

    // when
    const effects = createEffects(
      removeAndSetDefaultAccount({
        removeAccountId: id,
        newDefaultAccountId: id,
      }),
    );
    const action = TestUtils.getLastValue(
      effects.removeAndSetDefaultAccountEffect,
    );

    // then
    expect(graphqlService.setDefaultAccount).toHaveBeenCalledWith(id);
    expect(graphqlService.deleteAccountConnection).toHaveBeenCalledWith(id);

    expect(action).toEqual(removeAndSetDefaultAccountSuccess());
  }));

  it('should catch error when trying to remove account and set a default one', fakeAsync(() => {
    // given
    const id = 'abc-123';
    graphqlService.setDefaultAccount = jest.fn().mockReturnValue(of(true));
    graphqlService.deleteAccountConnection = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('Error removing account')));

    // when
    const effects = createEffects(
      removeAndSetDefaultAccount({
        removeAccountId: id,
        newDefaultAccountId: id,
      }),
    );
    const action = TestUtils.getLastValue(
      effects.removeAndSetDefaultAccountEffect,
    );

    // then
    expect(graphqlService.setDefaultAccount).toHaveBeenCalledWith(id);
    expect(graphqlService.deleteAccountConnection).toHaveBeenCalledWith(id);

    expect(action).toBeUndefined();
  }));
});
