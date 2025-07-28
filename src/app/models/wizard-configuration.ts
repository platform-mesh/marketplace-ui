import { ExtensionConfigurationWizardConfigSpec } from '@dxp/ngx-core/fundamental-wizard-generator';
import { WizardDefinition } from '@dxp/ngx-core/wizard';

export interface WizardConfig {
  dxpWizardConfiguration: ExtensionConfigurationWizardConfigSpec;
  wizardDefinition: WizardDefinition;
}
