import { CrEditResourceComponent } from './cr-edit-resource.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  APIServerConfig,
  AccountConnection,
  ProviderMetadata,
  ResourceConfig,
  ScopeType,
} from 'models/provider-metadata';
import { WizardConfig } from 'models/wizard-configuration';
import { of } from 'rxjs';
import { WizardConfigService } from 'services/wizard-config.service';
import {
  createAccountResource,
  editAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import { resourceViewState } from 'state/account-resources/account-resources.selectors';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

const extensionClassMock: ProviderMetadata = {
  name: 'Test Extension',
  displayName: 'Test Extension Display',
  description: 'Test Extension Description',
  scope: {
    type: ScopeType.PROJECT,
  },
  configurationMetadata: '',
  instance: null,
  isChangingInstallations: false,
};

const accountConnectionMock: AccountConnection = {
  description: '',
  displayName: 'Account Connection Display Name',
  name: 'name',
  image: { url: '' },
  type: {
    context: '',
    name: 'name',
    apiResourceConfig: {
      displayConfig: {
        apiServerConfig: {} as APIServerConfig,
        resourceConfig: {} as ResourceConfig,
        tableConfig: {
          columns: [
            {
              name: 'project-key',
              label: 'Project Key',
              dataPath: '.spec.projectKey',
              link: {
                target: '_blank',
                urlPath: '.status.projectUrl',
                url: 'url',
              },
            },
            {
              name: 'instance',
              label: 'Instance',
              dataPath: '.spec.instance',
            },
          ],
          messageStrip: [],
        },
        accountNamingConfig: {
          singular: 'Backlog project',
          plural: 'Backlog projects',
        },
      },
      wizardConfig: {
        name: '',
        configData: '',
        wizardDefinition: '',
      },
    },
  },
};

const accountResourceMock = {
  resourceName: 'Test Resource',
};

describe('CrEditResourceComponent', () => {
  let component: CrEditResourceComponent;
  let fixture: ComponentFixture<CrEditResourceComponent>;
  let store: MockStore<unknown>;
  let luigiClient: LuigiClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrEditResourceComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: resourceViewState,
              value: {
                extensionClass: extensionClassMock,
                accountConnection: accountConnectionMock,
                accountResource: accountResourceMock,
              },
            },
          ],
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            data: of({ dialogType: CreditDialogType.EDIT }),
          },
        },
        {
          provide: WizardConfigService,
          useValue: {
            mapRequiredStepsToShowAsRequired: jest.fn(),
            setDefaultValues: jest.fn(),
          },
        },
        {
          provide: LuigiClient,
          useValue: {
            linkManager: jest.fn().mockReturnValue({ goBack: jest.fn() }),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    luigiClient = TestBed.inject(LuigiClient);

    fixture = TestBed.createComponent(CrEditResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct values', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should call wizardError and navigate back on error', () => {
    const goBackSpy = jest.spyOn(luigiClient.linkManager(), 'goBack');
    const error = new Error('Test Error');
    component.wizardError(error);
    expect(goBackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'RESOURCE_ACCOUNT_CANCEL',
        wizardConfigError: error,
      }),
    );
  });

  it('should call wizardCanceled and navigate back on cancel', () => {
    const goBackSpy = jest.spyOn(luigiClient.linkManager(), 'goBack');
    component.wizardCanceled();
    expect(goBackSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'RESOURCE_ACCOUNT_CANCEL' }),
    );
  });

  it('should build spec correctly', () => {
    const wizardValues = { key1: 'value1', key2: 'value2' };
    const result = component.buildSpec(wizardValues);
    expect(result).toEqual(wizardValues);
  });

  it('should build empty spec correctly', () => {
    const wizardValues = {};
    const result = component.buildSpec(wizardValues);
    expect(result).toEqual(wizardValues);
  });

  it('should call editAccount with correct values on finish', () => {
    component['editAccount'] = jest.fn();
    const event = [{ name: 'key1', value: 'value1' }];
    component.finish(event);
    expect(component['editAccount']).toHaveBeenCalledWith({ key1: 'value1' });
  });

  describe('editAccount', () => {
    it('should dispatch editAccountResource when dialogType is EDIT and wizValueResult has .spec', fakeAsync(() => {
      const wizValueResult = { spec: { foo: { key: 'bar' } } };

      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component['dialogType'] = CreditDialogType.EDIT;
      fixture.detectChanges();

      component['editAccount'](wizValueResult);

      tick();
      expect(dispatchSpy).toHaveBeenCalledWith(
        editAccountResource({
          spec: wizValueResult.spec,
          extClass: extensionClassMock,
          accountConnection: accountConnectionMock,
          resourceName: accountResourceMock.resourceName,
        }),
      );
    }));

    it('should dispatch editAccountResource when dialogType is EDIT and wizValueResult has no .spec', fakeAsync(() => {
      const wizValueResult = { foo: { foo: { key: 'bar' } } };

      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component['dialogType'] = CreditDialogType.EDIT;

      fixture.detectChanges();

      component['editAccount'](wizValueResult);
      tick();

      expect(dispatchSpy).toHaveBeenCalledWith(
        editAccountResource({
          spec: wizValueResult,
          extClass: extensionClassMock,
          accountConnection: accountConnectionMock,
          resourceName: accountResourceMock.resourceName,
        }),
      );
    }));

    it('should dispatch createAccountResource when dialogType is not EDIT and wizValueResult has .spec and .metadata', fakeAsync(() => {
      const wizValueResult = {
        spec: { foo: { key: 'bar' } },
        metadata: { name: 'name' },
      };
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component['dialogType'] = CreditDialogType.CREATE;

      fixture.detectChanges();

      component['editAccount'](wizValueResult);
      tick();

      expect(dispatchSpy).toHaveBeenCalledWith(
        createAccountResource({
          metadata: wizValueResult.metadata,
          spec: wizValueResult.spec,
          extClass: extensionClassMock,
          accountConnection: accountConnectionMock,
        }),
      );
    }));

    it('should dispatch createAccountResource when dialogType is not EDIT and wizValueResult has no .spec or .metadata', fakeAsync(() => {
      const wizValueResult = { foo: { key: 'bar' } };

      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component['dialogType'] = CreditDialogType.CREATE;

      fixture.detectChanges();

      component['editAccount'](wizValueResult);
      tick();

      expect(dispatchSpy).toHaveBeenCalledWith(
        createAccountResource({
          metadata: {},
          spec: wizValueResult,
          extClass: extensionClassMock,
          accountConnection: accountConnectionMock,
        }),
      );
    }));
  });

  describe('wizardConfigDef observable', () => {
    it('should filter out falsy wizardConfig values', fakeAsync(() => {
      const store = TestBed.inject(Store);
      const wizardConfigService = TestBed.inject(WizardConfigService);

      const mapSpy = jest.spyOn(
        wizardConfigService,
        'mapRequiredStepsToShowAsRequired',
      );

      // Emit undefined first, then a valid config
      const validConfig = { foo: 'bar' } as unknown as WizardConfig;
      jest
        .spyOn(store, 'select')
        .mockReturnValueOnce(of(undefined))
        .mockReturnValueOnce(of(validConfig));

      // Create a new component instance to re-trigger the constructor logic
      const fixture = TestBed.createComponent(CrEditResourceComponent);
      const component = fixture.componentInstance;

      let called = false;
      component.wizardConfigDef.subscribe(() => {
        expect(mapSpy).toHaveBeenCalledWith(validConfig);
        called = true;
      });

      tick();
      expect(called).toBe(true);
    }));

    it('should call mapRequiredStepsToShowAsRequired with the wizardConfig', fakeAsync(() => {
      const store = TestBed.inject(Store);
      const wizardConfigService = TestBed.inject(WizardConfigService);

      const validConfig = { foo: 'bar' } as unknown as WizardConfig;
      const mappedConfig = { foo: 'baz' } as unknown as WizardConfig;

      jest.spyOn(store, 'select').mockReturnValue(of(validConfig));
      jest
        .spyOn(wizardConfigService, 'mapRequiredStepsToShowAsRequired')
        .mockReturnValue(mappedConfig);

      const fixture = TestBed.createComponent(CrEditResourceComponent);
      const component = fixture.componentInstance;

      let result: WizardConfig | undefined;
      component.wizardConfigDef.subscribe((value) => {
        result = value;
      });

      tick();
      expect(result).toBe(mappedConfig);
    }));
  });

  describe('wizardConfig observable', () => {
    it('should call setDialogType and setDefaultValues with valid defaults', fakeAsync(() => {
      const store = TestBed.inject(Store);
      const wizardConfigService = TestBed.inject(WizardConfigService);

      const defaults = { foo: 'bar' };
      const wizardConfig = { foo: 'baz' } as unknown as WizardConfig;
      const expectedResult = { foo: 'baz', result: 'ok' };

      jest
        .spyOn(store, 'select')
        .mockReturnValueOnce(of(defaults))
        .mockReturnValueOnce(of(wizardConfig));

      jest
        .spyOn(wizardConfigService, 'setDefaultValues')
        .mockReturnValue(expectedResult as unknown as WizardConfig);

      // Re-create component to re-trigger constructor logic
      const fixture = TestBed.createComponent(CrEditResourceComponent);
      const component = fixture.componentInstance;

      let result: unknown;
      component.wizardConfig.subscribe((value) => {
        result = value;
      });
      tick();

      expect(wizardConfigService.setDefaultValues).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    }));

    it('should call setDialogType and setDefaultValues with undefined defaults', fakeAsync(() => {
      const store = TestBed.inject(Store);
      const wizardConfigService = TestBed.inject(WizardConfigService);

      const wizardConfig = { foo: 'baz' } as unknown as WizardConfig;
      const expectedResult = { foo: 'baz', result: 'ok' };

      jest
        .spyOn(store, 'select')
        .mockReturnValueOnce(of(undefined))
        .mockReturnValueOnce(of(wizardConfig));

      jest
        .spyOn(wizardConfigService, 'setDefaultValues')
        .mockReturnValue(expectedResult as unknown as WizardConfig);

      // Re-create component to re-trigger constructor logic
      const fixture = TestBed.createComponent(CrEditResourceComponent);
      const component = fixture.componentInstance;

      let result: unknown;
      component.wizardConfig.subscribe((value) => {
        result = value;
      });
      tick();

      expect(wizardConfigService.setDefaultValues).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    }));
  });
});
