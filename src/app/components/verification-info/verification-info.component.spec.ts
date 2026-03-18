import { VerificationInfoComponent } from './verification-info.component';

describe('ProviderVerificationComponent', () => {
  const component: VerificationInfoComponent = new VerificationInfoComponent();

  beforeEach(() => {
    component = new ProviderVerificationComponent();
  });

  describe('mapVerificationInfo', () => {
    it('should return communityVerificationInfo when verification is undefined', () => {
      component.verification = undefined;
      expect(component.mapVerificationInfo()).toEqual(
        component.communityVerificationInfo,
      );
    });

    it('should return communityVerificationInfo when verification is null', () => {
      component.verification = null;
      expect(component.mapVerificationInfo()).toEqual(
        component.communityVerificationInfo,
      );
    });

    it('should return communityVerificationInfo for any verification type', () => {
      component.verification = { type: 'community' };
      expect(component.mapVerificationInfo()).toEqual(
        component.communityVerificationInfo,
      );
    });

    it('should return communityVerificationInfo regardless of verification type string', () => {
      component.verification = { type: 'some-unknown-type' };
      expect(component.mapVerificationInfo()).toEqual(
        component.communityVerificationInfo,
      );
    });
  });

  describe('communityVerificationInfo', () => {
    it('should have showIcon false', () => {
      expect(component.communityVerificationInfo.showIcon).toBe(false);
    });

    it('should have label Community', () => {
      expect(component.communityVerificationInfo.label).toBe('Community');
    });

    it('should have objectStatus neutral', () => {
      expect(component.communityVerificationInfo.objectStatus).toBe('neutral');
    });
  });

  describe('ngOnChanges', () => {
    it('should update verificationInfo when called', () => {
      component.verification = { type: 'community' };
      component.ngOnChanges({});
      expect(component.verificationInfo).toEqual(
        component.communityVerificationInfo,
      );
    });

    it('should set verificationInfo on initial change', () => {
      component.ngOnChanges({});
      expect(component.verificationInfo).toEqual(
        component.communityVerificationInfo,
      );
    });
  });
});
