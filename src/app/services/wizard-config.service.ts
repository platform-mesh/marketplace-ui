import { Injectable } from '@angular/core';
import { WizardConfig } from 'models/wizard-configuration';

@Injectable({ providedIn: 'root' })
export class WizardConfigService {
  mapRequiredStepsToShowAsRequired(wizardConfig: WizardConfig): WizardConfig {
    wizardConfig.dxpWizardConfiguration.steps =
      wizardConfig.dxpWizardConfiguration.steps?.map((step) => {
        return {
          ...step,
          sections: step.sections.map((section) => {
            return {
              ...section,
              items: section.items.map((item) => {
                return {
                  ...item,
                  showAsRequired: !!(item.required || item.showAsRequired),
                  required: undefined,
                };
              }),
            };
          }),
        };
      });
    return wizardConfig;
  }

  setDefaultValues(
    defaults: Record<string, unknown> | undefined,
    wizardConfig: WizardConfig | undefined,
  ): WizardConfig | undefined {
    if (wizardConfig?.wizardDefinition && defaults) {
      const wizardDefinition = wizardConfig.wizardDefinition;
      wizardDefinition.parameters.forEach((param) => {
        const parameters = param.name.split('.');
        param.default = parameters.reduce((acc, currentParam, index, arr) => {
          if (acc === undefined) {
            //Early exit if the acc array is already undefined
            arr.splice(1);
            return acc;
          }
          if (index === 0) {
            if (!['spec', 'metadata', 'status'].includes(currentParam)) {
              return (
                (acc[currentParam] as Record<string, unknown>) ??
                (acc['spec']
                  ? (acc['spec'] as Record<string, unknown>)[currentParam]
                  : undefined)
              );
            }
          }
          return acc[currentParam] as Record<string, unknown>;
        }, defaults);
      });
      wizardConfig.wizardDefinition = wizardDefinition;
    }
    return wizardConfig;
  }
}
