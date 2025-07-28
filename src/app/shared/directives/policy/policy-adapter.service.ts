import { PolicyObject } from './policy';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PmLuigiContextService } from 'services/luigi';
import { getEntityScopeFromContext } from 'shared/utils/entity-context.util';

@Injectable({
  providedIn: 'root',
})
export class PolicyAdapter {
  private readonly policies: Observable<PolicyObject>;

  constructor(private luigiContextService: PmLuigiContextService) {
    this.policies = this.luigiContextService.contextObservable().pipe(
      map((ctx) => {
        const entityScope = getEntityScopeFromContext(ctx?.context);
        const currentPolicyState = new PolicyObject();
        (entityScope?.entityPolicies || []).forEach((activePolicy) => {
          currentPolicyState[activePolicy] = true;
        });
        return currentPolicyState;
      }),
    );
  }

  getPolicies(): Observable<PolicyObject> {
    return this.policies;
  }
}
