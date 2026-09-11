import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardMainHeaderComponent,
  CardTitleDirective,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { TextComponent } from '@fundamental-ngx/core/text';
import { VerificationInfoComponent } from 'components/provider/verification-info/verification-info.component';
import { CatalogDataItem } from 'models/index';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-catalog-item[data]',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardMainHeaderComponent,
    InfoLabelComponent,
    AvatarComponent,
    CardTitleDirective,
    VerificationInfoComponent,
    CardContentComponent,
    FormLabelComponent,
    TextComponent,
  ],
  templateUrl: './catalog-item.component.html',
  styleUrl: './catalog-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogItemComponent {
  @Input()
  data!: CatalogDataItem;

  generateId(): string {
    if (this.data.image) {
      return Md5.hashStr(this.data.image);
    }
    if (this.data.glyph) {
      return this.data.glyph;
    }
    return 'no-icon';
  }
}
