import { BTPApolloClientService } from './btp-apollo-client.service';
import { BtpSecretService } from './btp-secret-service';
import { TestBed } from '@angular/core/testing';
import { EntityScopeService } from '@dxp/ngx-core/entity-scope';
import { of } from 'rxjs';
import { PmLuigiContextService } from 'services/luigi';

describe('BtpSecretService', () => {
  let service: BtpSecretService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BtpSecretService,
        {
          provide: BTPApolloClientService,
          useValue: {
            apollo: jest.fn(),
          },
        },
        {
          provide: PmLuigiContextService,
          useValue: {},
        },
        {
          provide: EntityScopeService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(BtpSecretService);
  });

  it('should call writeSecret with GROUP-SECRETS/ prefix', async () => {
    const mockApollo = {
      mutate: jest.fn().mockReturnValue(of({ data: { writeSecret: 'ok' } })),
    };
    // @ts-expect-error: mocking private property for test
    service['btpApolloClientService'].apollo.mockReturnValue(of(mockApollo));

    const projectId = 'proj1';
    const vaultPath = 'my-secret';
    const data = [{ key: 'foo', value: 'bar' }];

    const result = service
      .writeSecret(projectId, vaultPath, data)
      .subscribe((_) => {
        expect(result).toBe('ok');
        expect(mockApollo.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: expect.objectContaining({
              projectId,
              vaultPath: 'GROUP-SECRETS/btp-accounts-my-secret',
              data,
            }),
          }),
        );
      });
  });
});
