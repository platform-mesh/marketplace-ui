import { AdditionalInfo } from './additional-info';
import { Badge } from './badge';
import { Label } from './provider-metadata';
import { VerificationInfo } from 'models/verification-info';

export interface CatalogDataItem {
  title?: string;
  type?: string;
  description?: string;
  badge?: Badge;
  category?: string;
  provider?: string;
  image?: string;
  glyph?: string;
  additionalInfo?: AdditionalInfo[];
  labels?: Label[];
  verification?: VerificationInfo;
  testId?: string;
}
