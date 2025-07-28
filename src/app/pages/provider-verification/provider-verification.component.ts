import { Verification } from '../../models/verification';
import { VerificationInfo } from '../../models/verification-info';
import { VerificationType } from '../../models/verification-type';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ObjectStatusComponent } from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { InlineHelpDirective } from '@fundamental-ngx/core/inline-help';

@Component({
  selector: 'app-provider-verification',
  imports: [AvatarComponent, InlineHelpDirective, ObjectStatusComponent],
  templateUrl: './provider-verification.component.html',
  styleUrl: './provider-verification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderVerificationComponent implements OnChanges {
  /**
   * Represents the verification status, indicating whether it is verified by Hyperspace or a Hyperspace Partner.
   */
  @Input() verification?: Verification | null;
  verificationInfo?: VerificationInfo;

  ngOnChanges(_: SimpleChanges): void {
    this.verificationInfo = this.mapVerificationInfo();
  }

  communityVerificationInfo: VerificationInfo = {
    showIcon: false,
    label: 'Community',
    objectStatus: 'neutral',
  };

  hyperspaceVerificationInfo: VerificationInfo = {
    showIcon: true,
    label: 'Hyperspace',
    objectStatus: 'informative',
    inlineHelp: 'Official Hyperspace Offering',
  };

  hyperspacePartnerVerificationInfo: VerificationInfo = {
    showIcon: true,
    label: 'Hyperspace Partner',
    objectStatus: 'informative',
    inlineHelp: 'Verified Hyperspace Partner Offering',
  };

  mapVerificationInfo(): VerificationInfo {
    switch (this.verification?.type) {
      case VerificationType.Hyperspace:
        return this.hyperspaceVerificationInfo;
      case VerificationType.HyperspacePartner:
        return this.hyperspacePartnerVerificationInfo;
      default:
        return this.communityVerificationInfo;
    }
  }
}
