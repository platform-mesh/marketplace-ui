import {
  MessageBoxData,
  RemoveAccountConfirmationComponent,
} from './remove-account-confirmation.component';
import { RemoveAccountConfirmationComponentPo } from './remove-account-confirmation.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBoxRef } from '@fundamental-ngx/core';
import { MessageBoxConfig } from '@fundamental-ngx/core/message-box';
import { Store } from '@ngrx/store';
import { mock } from 'jest-mock-extended';
import { Account } from 'models/index';
import { MockProvider } from 'ng-mocks';
import {
  removeAccount,
  removeAndSetDefaultAccount,
} from 'state/accounts.action';

const mockAccounts = [
  {
    id: 'id',
    displayName: 'displayName',
    subType: 'Sub Type 1',
    type: {
      displayName: 'display name default',
      image: 'image.png',
      defaultAccount: {
        id: 'id',
      },
    },
    name: 'name',
  },
  {
    id: 'id2',
    displayName: 'displayName2',
    subType: 'Sub Type  2',
    type: {
      image: 'image2.png',
    },
    name: 'name2',
  },
  {
    id: 'id3',
    displayName: 'displayName3',
    subType: 'Sub Type  3',
    type: {
      image: 'image3.png',
    },
    name: 'name3',
  },
] as Account[];

describe('RemoveAccountConfirmationComponent', () => {
  let component: RemoveAccountConfirmationComponent;
  let fixture: ComponentFixture<RemoveAccountConfirmationComponent>;

  let messageBoxRef: MessageBoxRef<MessageBoxData>;
  let store: Store<unknown>;
  let removeAccountConfirmationComponentPo: RemoveAccountConfirmationComponentPo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MockProvider(MessageBoxRef, {
          data: {
            currentAccount: mockAccounts[0],
            allAccounts: mockAccounts,
          },
          close: jest.fn(),
        } satisfies Partial<MessageBoxRef>),
        MockProvider(MessageBoxConfig, {} satisfies MessageBoxConfig),
        MockProvider(Store, {
          dispatch: jest.fn(),
        }),
      ],
      imports: [RemoveAccountConfirmationComponent],
    }).compileComponents();

    messageBoxRef = TestBed.inject(MessageBoxRef);
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(RemoveAccountConfirmationComponent);
    component = fixture.componentInstance;
    removeAccountConfirmationComponentPo =
      new RemoveAccountConfirmationComponentPo(fixture.nativeElement);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('integration tests', () => {
    it('should display the correct confirmation message when default account', () => {
      const defaultText =
        removeAccountConfirmationComponentPo.defaultText?.textContent;

      expect(defaultText).toContain('default');
      // current default
      expect(defaultText).toContain(mockAccounts[0].type.displayName);
      expect(defaultText).toContain(mockAccounts[0].displayName);
      // Next default
      expect(defaultText).toContain(
        'Removing the  default display name default account displayName removes the link between display name default and the Hyperspace Portal product or experiment',
      );
    });

    it('should call `remove()` and close the dialog when the Remove button is clicked', () => {
      jest.spyOn(component, 'remove');
      jest.spyOn(component.messageBoxRef, 'close');

      removeAccountConfirmationComponentPo.enterConfirmationText('displayName');
      fixture.detectChanges();
      removeAccountConfirmationComponentPo.clickRemoveButton();

      expect(component.remove).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should close the dialog when the Cancel button is clicked', () => {
      jest.spyOn(component, 'cancel');
      jest.spyOn(component.messageBoxRef, 'close');

      removeAccountConfirmationComponentPo.clickCancelButton();

      expect(component.cancel).toHaveBeenCalled();
      expect(component.messageBoxRef.close).toHaveBeenCalled();
    });

    it('should display the correct override label when changing the default account', () => {
      component.nextDefaultAccounts = mockAccounts;
      fixture.detectChanges();

      const overrideLabel =
        removeAccountConfirmationComponentPo.defaultAccountLabel?.textContent?.trim();
      expect(overrideLabel).toContain('New default Account');
    });
  });

  it('should close dialog when canceled', () => {
    component.cancel();

    expect(messageBoxRef.close).toHaveBeenCalled();
  });

  describe('should dispatch remove and set default account event', () => {
    it('when deleting the current default account and just one other account left', () => {
      component.nextDefaultAccounts = [mock<Account>({ id: 'id' })];
      component.confirmationCheck.setValue('displayName');

      component.remove();

      expect(store.dispatch).toHaveBeenCalledWith(
        removeAndSetDefaultAccount({
          removeAccountId: 'id',
          newDefaultAccountId: 'id',
        }),
      );
      expect(messageBoxRef.close).toHaveBeenCalled();
    });
    it('when deleting the current default account and more then 2 accounts are left', () => {
      component.defaultAccount.setValue(mock<Account>({ id: 'id' }));
      component.confirmationCheck.setValue('displayName');
      component.nextDefaultAccounts = [
        mock<Account>({ id: 'id1' }),
        mock<Account>({ id: 'id2' }),
        mock<Account>({ id: 'id3' }),
      ];

      component.remove();

      expect(store.dispatch).toHaveBeenCalledWith(
        removeAndSetDefaultAccount({
          removeAccountId: 'id',
          newDefaultAccountId: 'id',
        }),
      );
      expect(messageBoxRef.close).toHaveBeenCalled();
    });
  });

  describe('should dispatch only remove account event', () => {
    it('when the last account is deleted', () => {
      component.confirmationCheck.setValue('displayName');
      component.nextDefaultAccounts = [];

      component.remove();

      expect(store.dispatch).toHaveBeenCalledWith(removeAccount({ id: 'id' }));
      expect(messageBoxRef.close).toHaveBeenCalled();
    });
    it('when the deleted account is not default', () => {
      component.confirmationCheck.setValue('displayName');
      if (component.account.type?.defaultAccount) {
        component.account.type.defaultAccount.id = 'other-id';
      }
      component.nextDefaultAccounts = [
        mock<Account>({ id: 'id1' }),
        mock<Account>({ id: 'id2' }),
        mock<Account>({ id: 'id3' }),
      ];

      component.remove();

      expect(store.dispatch).toHaveBeenCalledWith(
        removeAccount({
          id: 'id',
        }),
      );
      expect(messageBoxRef.close).toHaveBeenCalled();
    });
  });

  describe('should NOT dispatch event', () => {
    it('when account name does not match', () => {
      component.confirmationCheck.setValue('wrong-displayName');

      component.remove();

      expect(store.dispatch).not.toHaveBeenCalled();
      expect(messageBoxRef.close).not.toHaveBeenCalled();
    });
    it('when deleting the default account and next default account is not selected', () => {
      component.confirmationCheck.setValue('wrong-displayName');
      component.nextDefaultAccounts = [
        mock<Account>({ id: 'id1' }),
        mock<Account>({ id: 'id2' }),
        mock<Account>({ id: 'id3' }),
      ];

      component.remove();

      expect(store.dispatch).not.toHaveBeenCalled();
      expect(messageBoxRef.close).not.toHaveBeenCalled();
    });
  });
});
