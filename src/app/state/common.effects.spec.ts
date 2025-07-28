import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { NotificationService } from '@dxp/ngx-core/notification';
import { TestUtils } from '@dxp/ngx-core/test';
import { MessageBoxService } from '@fundamental-ngx/core';
import { LinkManager } from '@luigi-project/client';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { of } from 'rxjs';
import {
  goBackAction,
  requestFailed,
  showConfirmation,
} from 'state/common.action';
import { CommonEffects } from 'state/common.effects';

describe(`common effects`, () => {
  let luigiClient: MockProxy<LuigiClient>;
  let messageBoxService: MockProxy<MessageBoxService>;
  let mockStore: Store;
  let notificationService: MockProxy<NotificationService>;

  beforeEach(() => {
    messageBoxService = mock<MessageBoxService>();
    notificationService = mock<NotificationService>();
    luigiClient = mock<LuigiClient>();
    mockStore = createMockStore();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new CommonEffects(
      new Actions(of(action)),
      messageBoxService,
      notificationService,
      mockStore,
      luigiClient,
    );
  }

  it('should open a message box on failed requests', fakeAsync(() => {
    // given
    const error = mock<HttpErrorResponse>();
    const dialogTitle = 'error dialog title';
    const action = requestFailed({
      error,
      goBack: false,
      dialogTitle: dialogTitle,
    });

    // when
    const effects = createEffects(action);
    TestUtils.getLastValue(effects.resourceRequestFailed);

    // then
    expect(messageBoxService.open).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dialogTitle,
      }),
      { type: 'error' },
    );
  }));

  it('should dispatch goBackAction and close the message box when approveButtonCallback is called and goBack is true', fakeAsync(() => {
    const error = mock<HttpErrorResponse>();
    const dialogTitle = 'error dialog title';
    const action = requestFailed({
      error,
      goBack: true,
      dialogTitle: dialogTitle,
    });

    const close = jest.fn();
    let approveButtonCallback: (() => void) | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messageBoxService.open.mockImplementation((config: any) => {
      approveButtonCallback = config.approveButtonCallback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { close } as any;
    });

    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

    const effects = new CommonEffects(
      new Actions(of(action)),
      messageBoxService,
      notificationService,
      mockStore,
      luigiClient,
    );
    TestUtils.getLastValue(effects.resourceRequestFailed);

    approveButtonCallback!();

    expect(dispatchSpy).toHaveBeenCalledWith(
      goBackAction({ action: LuigiGoBackAction.RESOURCE_ACCOUNT_ERROR }),
    );
    expect(close).toHaveBeenCalled();
  }));

  it('should show a message toast', fakeAsync(() => {
    // given
    const action = showConfirmation({
      message: 'message',
    });

    // when
    const effects = createEffects(action);
    TestUtils.getLastValue(effects.showConfirmation);

    //then
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'message',
    );
  }));

  it('should go back', fakeAsync(() => {
    // given
    const action = goBackAction({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED,
    });
    const linkManager = mock<LinkManager>();
    luigiClient.linkManager.mockReturnValue(linkManager);

    // when
    const effects = createEffects(action);
    TestUtils.getLastValue(effects.goBack);

    //then
    expect(linkManager.goBack).toHaveBeenCalledWith({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED,
    });
  }));
});
