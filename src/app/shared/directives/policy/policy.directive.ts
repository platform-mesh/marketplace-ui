import { Policy, PolicyObject } from './policy';
import { PolicyAdapter } from './policy-adapter.service';
import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

type PolicyDirectiveOperation = 'and' | 'or';

@Directive({
  selector: '[requiredPolicies]',
  standalone: true,
})
export class PolicyDirective implements OnInit, OnDestroy {
  private operatorToBeUsed: PolicyDirectiveOperation;

  @Input()
  set requiredPolicies(policies: string[] | string) {
    const policiesToCheck = Array.isArray(policies) ? policies : [policies];
    this.policiesToBeChecked = policiesToCheck.map(
      PolicyDirective.applyNegationIfRequired,
    );
  }

  @Input()
  set requiredPoliciesOperator(operator: PolicyDirectiveOperation) {
    this.operatorToBeUsed = operator;
  }

  constructor(
    private policyAdapter: PolicyAdapter,
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.policiesToBeChecked = [];
    this.operatorToBeUsed = 'and';
  }

  private policiesToBeChecked: Policy[];
  private policySubscription: Subscription = new Subscription();

  static applyNegationIfRequired(
    policiesToBeCheckedForNegation: string,
  ): Policy {
    if (policiesToBeCheckedForNegation.startsWith('!')) {
      return {
        mustBePresent: false,
        name: policiesToBeCheckedForNegation.slice(1),
      };
    }
    return { mustBePresent: true, name: policiesToBeCheckedForNegation };
  }

  ngOnInit(): void {
    this.policySubscription.add(
      this.policyAdapter
        .getPolicies()
        .pipe(
          distinctUntilChanged((prev, curr) =>
            Object.keys(prev).every((key) => prev[key] === curr[key]),
          ),
        )
        .subscribe((currentPolicies) => {
          if (!this.policiesToBeChecked.length) {
            return;
          }
          const hasRequiredPolicies =
            this.checkPoliciesBasedOnOperator(currentPolicies);
          this.updateView(hasRequiredPolicies);
        }),
    );
  }

  ngOnDestroy(): void {
    this.policySubscription.unsubscribe();
  }

  private checkPoliciesBasedOnOperator(currentPolicies: PolicyObject): boolean {
    if (this.operatorToBeUsed === 'or') {
      return this.policiesToBeChecked.some(
        (policy) =>
          Object.prototype.hasOwnProperty.call(currentPolicies, policy.name) ===
          policy.mustBePresent,
      );
    }
    return this.policiesToBeChecked.every(
      (policy) =>
        Object.prototype.hasOwnProperty.call(currentPolicies, policy.name) ===
        policy.mustBePresent,
    );
  }

  private updateView(hasRequiredPolicies: boolean): void {
    this.viewContainer.clear();
    if (hasRequiredPolicies) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
    this.changeDetector.detectChanges();
  }
}
