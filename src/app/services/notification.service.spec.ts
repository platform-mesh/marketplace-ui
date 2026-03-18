import {
  DEFAULT_TOAST_CLOSE_AFTER,
  NotificationService,
} from './notification.service';
import { UxManager } from '@luigi-project/client';
import { LuigiClient } from '@platform-mesh/iam-lib';
import { mock } from 'jest-mock-extended';

describe('NotificationService', () => {
  const showAlertMock = jest.fn();
  const luigiClient = mock<LuigiClient>({
    uxManager: () => mock<UxManager>({ showAlert: showAlertMock }),
  });
  const service = new NotificationService(luigiClient);
  afterEach(() => jest.resetAllMocks());
  describe('openErrorStrip', () => {
    it('should open error message strip', () => {
      const errorMessage = 'Some error occurred';
      service.openErrorStrip(errorMessage);
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: errorMessage,
        type: 'error',
      });
    });
  });

  describe('openSuccessToast', () => {
    it('should open with expected message', () => {
      const successMessage = 'Something happened';
      service.openSuccessToast(successMessage, 3000);
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: successMessage,
        type: 'message-toast',
        closeAfter: 3000,
      });
    });

    it('should open with message starting with upper case', () => {
      service.openSuccessToast('something happened', 3000);
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Something happened',
        type: 'message-toast',
        closeAfter: 3000,
      });
    });

    it('should open with default close duration', () => {
      service.openSuccessToast('');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: '',
        type: 'message-toast',
        closeAfter: DEFAULT_TOAST_CLOSE_AFTER,
      });
    });
  });
});
