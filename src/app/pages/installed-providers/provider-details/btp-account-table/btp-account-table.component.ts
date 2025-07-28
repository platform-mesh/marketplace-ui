import { TableItem } from './table-item.component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  input,
} from '@angular/core';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import {
  ButtonComponent,
  ContentDensityDirective,
} from '@fundamental-ngx/core';
import {
  FdpCellDef,
  FdpHeaderCellDef,
  FdpTableCell,
  FdpTableHeader,
  TableColumnComponent,
  TableComponent,
  TableInitialStateDirective,
  TableToolbarActionsComponent,
  TableToolbarComponent,
} from '@fundamental-ngx/platform';
import { ProviderMetadata } from 'models/provider-metadata';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BtpSecretService } from 'services/btp-secret-service';
import { PolicyDirective } from 'shared/directives/policy';

@Component({
  selector: 'app-btp-account-table',
  imports: [
    ButtonComponent,
    TableComponent,
    TableToolbarComponent,
    TableToolbarActionsComponent,
    TableColumnComponent,
    FdpTableCell,
    PolicyDirective,
    TableInitialStateDirective,
    FdpTableHeader,
    FdpHeaderCellDef,
    FdpCellDef,
    ContentDensityDirective,
  ],
  templateUrl: './btp-account-table.component.html',
  styleUrl: './btp-account-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BtpAccountTableComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  provider = input.required<ProviderMetadata>();
  protected accounts: TableItem[];

  constructor(
    private btpSecretService: BtpSecretService,
    private cd: ChangeDetectorRef,
    private luigiClient: LuigiClient,
  ) {
    this.accounts = [];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.btpSecretService
      .getBTPSecrets()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (secrets) => {
          const accounts = secrets
            .filter((secret) =>
              secret.path.startsWith(this.btpSecretService.BTPPREFIX),
            )
            .map((secret) =>
              secret.path.replace(this.btpSecretService.BTPPREFIX, ''),
            )
            .map((x) => ({ ga: x }));

          this.accounts = accounts;
          this.cd.detectChanges();
        },
      });
  }

  addAccount(): void {
    const extensionClass = this.provider();
    if (extensionClass?.accountConnections) {
      const accountConnection = extensionClass?.accountConnections[0];
      this.luigiClient
        .linkManager()
        .fromClosestContext()
        .withParams({
          type: accountConnection?.type?.name || '',
        })
        .navigate(
          `create-btp-acc/${extensionClass?.scope?.type.toString().toLowerCase()}/${
            extensionClass?.name
          }`,
          undefined,
          true,
          {
            title: `Create BTP Account`,
            size: 's',
          },
        );
    }
  }

  editAccount(item: string): void {
    // Logic to edit the account
    console.log(`Editing account: ${item}`);
  }

  removeAccount(item: string): void {
    // Logic to remove the account
    console.log(`Removing account: ${item}`);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
