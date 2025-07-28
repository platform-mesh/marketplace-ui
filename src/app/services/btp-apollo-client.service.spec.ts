import { BTPApolloClientService } from './btp-apollo-client.service';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

describe('DxpApolloClientService', () => {
  let service: BTPApolloClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(BTPApolloClientService, {})],
    });
    service = TestBed.inject(BTPApolloClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
