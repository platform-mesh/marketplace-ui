import { LuigiClient } from './luigi-client.service';
import { LuigiDialogUtil } from './luigi-dialog-util.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DialogRef } from '@fundamental-ngx/core/dialog';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';

describe('LuigiDialogUtil', () => {
  let luigiDialogUtil: LuigiDialogUtil;
  let luigiClient: LuigiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiClient, {
          uxManager: jest.fn().mockReturnValue({
            addBackdrop: jest.fn(),
            removeBackdrop: jest.fn(),
          }),
        }),
      ],
    });

    luigiClient = TestBed.inject(LuigiClient);
    luigiDialogUtil = TestBed.inject(LuigiDialogUtil);
  });

  it('should manage luigi backdrops', fakeAsync(() => {
    const dialogRef: DialogRef = mock<DialogRef>();
    const afterClosed = new Subject();
    dialogRef.afterClosed = afterClosed;

    const dialogOpened = jest.fn();
    const dialogClosed = jest.fn();
    luigiDialogUtil['dialogOpened'] = dialogOpened;
    luigiDialogUtil['dialogClosed'] = dialogClosed;

    luigiDialogUtil.manageLuigiBackdrops(dialogRef);

    expect(dialogOpened).toHaveBeenCalledTimes(1);

    afterClosed.next({});
    tick();

    expect(dialogClosed).toHaveBeenCalledTimes(1);

    afterClosed.next(() => {
      throw 'foo';
    });
    tick();
    expect(dialogClosed).toHaveBeenCalledTimes(2);
  }));

  it('should count up', fakeAsync(() => {
    luigiDialogUtil['dialogOpened']();

    expect(luigiDialogUtil['dialogOpenCounter']).toEqual(1);
    expect(luigiClient.uxManager().addBackdrop).toHaveBeenCalled();
  }));

  it('should count down and call removeBackdrop', fakeAsync(() => {
    luigiDialogUtil['dialogOpenCounter'] = 1;

    luigiDialogUtil['dialogClosed']();

    expect(luigiDialogUtil['dialogOpenCounter']).toEqual(0);
    expect(luigiClient.uxManager().removeBackdrop).toHaveBeenCalled();
  }));

  it('should count down and call not removeBackdrop', fakeAsync(() => {
    luigiDialogUtil['dialogOpenCounter'] = 2;

    luigiDialogUtil['dialogClosed']();

    expect(luigiDialogUtil['dialogOpenCounter']).toEqual(1);
    expect(luigiClient.uxManager().removeBackdrop).not.toHaveBeenCalled();
  }));
});
