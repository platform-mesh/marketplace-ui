import { CatalogComponent } from './catalog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { PmLuigiContextService } from 'services/luigi';
import { InfoLabelFilter } from 'shared/components/catalog';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(), data: of() },
        },
        MockProvider(GraphqlService, {}),
        MockProvider(PmLuigiContextService, {
          contextObservable: jest.fn().mockReturnValue(of({})),
        }),
      ],
      imports: [CatalogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when buildInfoLabelFilters is called', () => {
    const cases: [object, InfoLabelFilter[]][] = [
      [
        {
          provider: '',
        },
        [
          {
            label: 'provider',
            values: [''],
          },
        ],
      ],
      [
        {
          provider: 'hyperspace',
        },
        [
          {
            label: 'provider',
            values: ['hyperspace'],
          },
        ],
      ],
      [
        {
          provider: 'hyperspace%2Cdxp',
        },
        [
          {
            label: 'provider',
            values: ['hyperspace', 'dxp'],
          },
        ],
      ],
      [
        {
          provider: 'hyperspace%2Cdxp',
          category: 'Software',
          song: 'burrito%20sabanero%2Cmacarena%2C%20%20%20%20%20%20%20%20%20%20%20%20%20%20bichota',
        },
        [
          {
            label: 'provider',
            values: ['hyperspace', 'dxp'],
          },
          {
            label: 'category',
            values: ['Software'],
          },
          {
            label: 'song',
            values: ['burrito sabanero', 'macarena', 'bichota'],
          },
        ],
      ],
    ];

    cases.forEach(([params, expectedFilters]) => {
      it(`should build expected info label filters for params: ${JSON.stringify(params)}`, () => {
        const filter = component.buildInfoLabelFilters(
          convertToParamMap(params),
        );
        expect(filter).toEqual(expectedFilters);
      });
    });

    it('should return undefined if queryParams is undefined', () => {
      expect(component.buildInfoLabelFilters(undefined)).toBeUndefined();
    });

    it('should return undefined if queryParams has no keys', () => {
      const emptyParamMap = {
        keys: [],
        get: () => null,
        has: () => false,
        getAll: () => [],
      } as unknown as ParamMap;
      expect(component.buildInfoLabelFilters(emptyParamMap)).toBeUndefined();
    });
  });
});
