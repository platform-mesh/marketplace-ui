import { EditAccountComponent } from './edit-account.component';
import { EditAccountComponentPo } from './edit-account.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MessageBoxConfig,
  MessageBoxRef,
} from '@fundamental-ngx/core/message-box';
import { Store } from '@ngrx/store';
import { mock } from 'jest-mock-extended';
import { Account } from 'models/index';
import { MockProvider } from 'ng-mocks';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import { setDefaultAccount } from 'state/accounts.action';

describe('EditAccountConfirmationComponent', () => {
  const mockAccount = {
    id: 'id',
    displayName: 'Test Account',
    subType: 'Sub Type 1',
    type: {
      image: 'image.png',
      defaultAccount: { id: '2', displayName: 'A Default Account' },
    },
    name: 'name',
  } as Account;

  let component: EditAccountComponent;
  let fixture: ComponentFixture<EditAccountComponent>;

  let messageBoxRef: MessageBoxRef;
  let store: Store<unknown>;
  let editAccountComponentPo: EditAccountComponentPo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MockProvider(MessageBoxRef, {
          data: mockAccount,
          close: jest.fn(),
        }),
        MockProvider(MessageBoxConfig, {} satisfies MessageBoxConfig),
        MockProvider(Store, {
          dispatch: jest.fn(),
        }),
        AccountNamingService,
      ],
      imports: [EditAccountComponent],
    }).compileComponents();

    messageBoxRef = TestBed.inject(MessageBoxRef);
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(EditAccountComponent);
    component = fixture.componentInstance;
    editAccountComponentPo = new EditAccountComponentPo(fixture.nativeElement);
    fixture.detectChanges();
  });

  it('should close dialog when canceled', () => {
    component.cancel();

    expect(messageBoxRef.close).toHaveBeenCalled();
  });

  it('should dispatch set default account event', () => {
    component.setDefault = true;

    component.edit();

    expect(store.dispatch).toHaveBeenCalledWith(
      setDefaultAccount({ id: 'id' }),
    );
    expect(messageBoxRef.close).toHaveBeenCalled();
  });

  it('should not dispatch set default account when the current one is already default', () => {
    component.account = {
      type: {
        defaultAccount: mock<Account>({ id: 'id' }),
      },
    } as Account;

    component.edit();

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(messageBoxRef.close).toHaveBeenCalled();
  });

  describe('integration tests', () => {
    it('should display the correct title', () => {
      expect(
        editAccountComponentPo.getTextContent(
          editAccountComponentPo.pageTitle!,
        ),
      ).toContain('Edit account');
    });

    it('should display the correct avatar', () => {
      expect(editAccountComponentPo.avatar).toBeTruthy();
      expect(
        editAccountComponentPo.avatar?.getAttribute('ng-reflect-image'),
      ).toContain(mockAccount.type.image);
    });

    it('should display account display name and subtype', () => {
      expect(
        editAccountComponentPo.getTextContent(
          editAccountComponentPo.displayName!,
        ),
      ).toEqual(component.account.displayName);
      expect(
        editAccountComponentPo.getTextContent(
          editAccountComponentPo.accountSubType!,
        ),
      ).toEqual(component.account.subType);
    });

    it('should display the "Set as Default" checkbox is enabled', () => {
      const overrideLabel = editAccountComponentPo.overrideDefaultLabel;

      expect(editAccountComponentPo.setDefaultCheckbox).toBeTruthy();
      expect(
        editAccountComponentPo.setDefaultCheckbox?.hasAttribute('disabled'),
      ).toBe(false);

      expect(editAccountComponentPo.getTextContent(overrideLabel!)).toContain(
        'This will override the current default account',
      );
      expect(editAccountComponentPo.getTextContent(overrideLabel!)).toContain(
        mockAccount.type.defaultAccount?.displayName,
      );
    });

    it('should call edit and close methods when saving changes', () => {
      jest.spyOn(component, 'edit');
      jest.spyOn(component.messageBoxRef, 'close');

      editAccountComponentPo.clickSaveButton();

      expect(component.edit).toHaveBeenCalled();
      expect(component.messageBoxRef.close).toHaveBeenCalled();
    });

    it('should close the dialog when cancel is clicked', () => {
      jest.spyOn(component, 'cancel');
      jest.spyOn(component.messageBoxRef, 'close');

      editAccountComponentPo.clickCancelButton();

      expect(component.cancel).toHaveBeenCalled();
      expect(component.messageBoxRef.close).toHaveBeenCalled();
    });
  });
});
