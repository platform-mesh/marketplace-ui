import { Verification } from '../../catalog';
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
import { VerificationInfo } from 'models/verification-info';

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

  mapVerificationInfo(): VerificationInfo {
    return this.communityVerificationInfo;
  }
}
