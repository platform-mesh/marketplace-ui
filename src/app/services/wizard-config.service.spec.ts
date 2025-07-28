import { WizardConfigService } from './wizard-config.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { WizardConfig } from 'models/wizard-configuration';

describe('WizardConfigService', () => {
  let service: WizardConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardConfigService);
  });

  describe('mapRequiredStepsToShowAsRequired', () => {
    it('should mark required steps as showAsRequired', () => {
      const wizardConfig = mock<WizardConfig>({
        dxpWizardConfiguration: {
          steps: [
            {
              sections: [
                {
                  items: [
                    { required: true, showAsRequired: false },
                    { required: false, showAsRequired: true },
                  ],
                },
              ],
            },
          ],
        },
      });

      const result = service.mapRequiredStepsToShowAsRequired(wizardConfig);

      expect(
        result.dxpWizardConfiguration.steps[0].sections[0].items[0]
          .showAsRequired,
      ).toBe(true);
      expect(
        result.dxpWizardConfiguration.steps[0].sections[0].items[1]
          .showAsRequired,
      ).toBe(true);
    });
  });

  describe('setDefaultValues', () => {
    it('should set default values correctly', () => {
      const wizardConfig = mock<WizardConfig>({
        wizardDefinition: {
          parameters: [
            { name: 'spec.costCenterInfo', default: '' },
            { name: 'spec.costCenterInfo.costCenter', default: '' },
            { name: 'spec.costCenterInfo.costCenterOwner', default: '' },
            { name: 'other.subproperty', default: '' },
            { name: 'costCenterInfo.costCenter', default: '' },
            { name: 'costCenterInfo.notExistingProp', default: '' },
            { name: 'notExistingProp', default: '' },
          ],
        },
      });

      const defaults = {
        metadata: {
          name: 'cost-center-name',
        },
        spec: {
          costCenterInfo: {
            costCenter: 'test',
            costCenterOwner: 'owner',
          },
        },
        other: {
          subproperty: true,
        },
      };

      const result = service.setDefaultValues(defaults, wizardConfig);

      expect(result?.wizardDefinition.parameters[0].default).toEqual({
        costCenter: 'test',
        costCenterOwner: 'owner',
      });
      expect(result?.wizardDefinition.parameters[1].default).toBe('test');
      expect(result?.wizardDefinition.parameters[2].default).toBe('owner');
      expect(result?.wizardDefinition.parameters[3].default).toBe(true);
      expect(result?.wizardDefinition.parameters[4].default).toBe('test');
      expect(result?.wizardDefinition.parameters[5].default).toBe(undefined);
      expect(result?.wizardDefinition.parameters[6].default).toBe(undefined);
    });
  });
});
