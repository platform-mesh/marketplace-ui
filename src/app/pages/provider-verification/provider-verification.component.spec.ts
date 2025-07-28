import { ProviderVerificationComponent } from './provider-verification.component';
import { Verification, VerificationType } from 'models/index';

describe('ProviderVerificationComponent', () => {
  const component: ProviderVerificationComponent =
    new ProviderVerificationComponent();

  it.each([
    [
      'with undefined verification, it should return by Community',
      undefined,
      component.communityVerificationInfo,
    ],
    [
      'with null verification, it should return by Community',
      null,
      component.communityVerificationInfo,
    ],
    [
      'with verification other than hyperspace, it should return by Community',
      {
        type: 'HyperPollo',
      },
      component.communityVerificationInfo,
    ],
    [
      'with undefined verification type, it should return by Community',
      {
        type: undefined,
      },
      component.communityVerificationInfo,
    ],
    [
      'with null verification type, it should return by Community',
      {
        type: null,
      },
      component.communityVerificationInfo,
    ],
    [
      'with null hyperspace verification type, it should return by Hyperspace',
      {
        type: VerificationType.Hyperspace,
      },
      component.hyperspaceVerificationInfo,
    ],
    [
      'with null hyperspace partner type, it should return by Hyperspace Partner',
      {
        type: VerificationType.HyperspacePartner,
      },
      component.hyperspacePartnerVerificationInfo,
    ],
  ])(
    'when mapVerificationInfo %s',
    (_, verification, expectedVerificationInfo): void => {
      component.verification = verification as Verification;

      const verificationInfoResult = component.mapVerificationInfo();

      expect(verificationInfoResult).toEqual(expectedVerificationInfo);
    },
  );
});
