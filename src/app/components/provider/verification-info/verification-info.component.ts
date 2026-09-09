import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ObjectStatusComponent } from '@fundamental-ngx/core';
import { InlineHelpDirective } from '@fundamental-ngx/core/inline-help';
import { VerificationInfo } from 'models/verification-info';

@Component({
  selector: 'app-provider-verification',
  imports: [InlineHelpDirective, ObjectStatusComponent],
  templateUrl: './verification-info.component.html',
  styleUrl: './verification-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationInfoComponent {
  verificationInfo = input<VerificationInfo | undefined>();
}
