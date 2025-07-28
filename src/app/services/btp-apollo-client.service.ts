import { Injectable, Injector } from '@angular/core';
import { BaseApolloClientService } from '@dxp/ngx-core/apollo';
import { Context } from '@luigi-project/client';

@Injectable({
  providedIn: 'root',
})
export class BTPApolloClientService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, 'pipeline-backend');
  }

  protected getApiUrl(luigiContext: Context): string {
    return luigiContext.frameContext.pipelineBackendUrl;
  }
}
