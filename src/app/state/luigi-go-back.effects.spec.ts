import { accountAddedSuccess } from './accounts.action';
import { LuigiGoBackEffect } from './luigi-go-back.effect';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { NotificationService } from '@dxp/ngx-core/notification';
import { TestUtils } from '@dxp/ngx-core/test';
import { LinkManager, UxManager } from '@luigi-project/client';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { mock } from 'jest-mock-extended';
import { LuigiGoBackAction, NodeContext } from 'models/index';
import { Observable, of } from 'rxjs';
import { luigiContextUpdate } from 'services/luigi/state';

const luigiClient = mock<LuigiClient>({
  linkManager: jest.fn().mockReturnValue(mock<LinkManager>()),
  uxManager: jest.fn().mockReturnValue(mock<UxManager>()),
});
const notificationService = mock<NotificationService>();
describe('LuigiGoBackEffect', () => {
  let actions: Observable<Action>;
  let effects: LuigiGoBackEffect;

  beforeEach(() => {
    actions = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions),
        { provide: LuigiClient, useValue: luigiClient },
        { provide: NotificationService, useValue: notificationService },
      ],
    });

    effects = TestBed.inject(LuigiGoBackEffect);
  });

  describe('extensionDetails', () => {
    it('should handle account added Luigi GoBack action', fakeAsync(() => {
      const luigiContext = mock<NodeContext>({
        goBackContext: { action: LuigiGoBackAction.ACCOUNT_ADDED },
      });
      const action = luigiContextUpdate({ luigiContext });
      actions = of(action);

      const expectedAction = accountAddedSuccess();

      const emittedAction = TestUtils.getLastValue(effects.providerDetails);

      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('extensionDetailsWithoutDispatched', () => {
    it('should handle wizard config error Luigi GoBack action', fakeAsync(() => {
      const luigiContext = mock<NodeContext>({
        goBackContext: {
          action: LuigiGoBackAction.WIZARD_CONFIG_ERROR,
          wizardConfigError: {
            title: 'title',
            message: 'message',
          },
        },
      });
      const action = luigiContextUpdate({ luigiContext });
      actions = of(action);

      TestUtils.getLastValue(effects.providerDetailsWithoutDispatched);

      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        type: 'error',
        text: 'title: message',
      });
    }));
  });
});
