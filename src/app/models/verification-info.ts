import { ObjectStatus } from '@fundamental-ngx/core/object-status';

export interface VerificationInfo {
  label: string;
  hint?: string;
  status?: ObjectStatus;
  icon?: string;
}
