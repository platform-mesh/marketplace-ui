import { CatalogDataItem } from '../../models';
import { ProvidersUtils } from '../../services/providers.utils';
import { CoreCatalogComponent } from './core-catalog.component';
import { CatalogPagePo } from './core-catalog.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionItem } from '@fundamental-ngx/platform';
import { mock } from 'jest-mock-extended';
import { CategoriesUtils } from 'shared/components/catalog';

describe('CoreCatalogComponent', () => {
  let component: CoreCatalogComponent;
  let fixture: ComponentFixture<CoreCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreCatalogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoreCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get suggestions if enabled', () => {
    const expectedSuggestions: SuggestionItem[] = [
      { value: 'Item 1' },
      { value: 'Item 2' },
    ];

    const mockData: CatalogDataItem[] = [
      { title: 'Item 1', description: 'Description 1' },
      { title: 'Item 2', description: 'Description 2' },
    ];

    component.data = mockData;
    component.enableSuggestions = true;

    component.ngOnInit();

    expect(component.suggestions).toEqual(expectedSuggestions);
  });

  it('should filter categories and providers if filterHeader is enabled', () => {
    const mockData: CatalogDataItem[] = [
      { title: 'Item 1', description: 'Description 1' },
      { title: 'Item 2', description: 'Description 2' },
    ];

    component.data = mockData;
    component.filterHeader = true;

    component.ngOnInit();

    expect(component.categories).toEqual(['All']);
    expect(component.providers).toEqual([
      {
        id: 'hyperspace',
        label: 'Hyperspace',
      },
      {
        id: 'hyperspacePartner',
        label: 'Hyperspace Partner',
      },
      {
        id: 'community',
        label: 'Community',
      },
    ]);
  });

  it('should fire itemClicked event', () => {
    const item = mock<CatalogDataItem>();
    component.itemClicked.emit = jest.fn();

    component.itemClickedHandler(item);

    expect(component.itemClicked.emit).toHaveBeenCalledWith(item);
  });

  it('should react on changes', () => {
    component.data = [
      {
        title: 'interesting title',
        additionalInfo: [
          {
            label: 'content',
            value: 'interesting',
          },
        ],
      },
      {
        title: 'Boring title',
        additionalInfo: [
          {
            label: 'content',
            value: 'boring',
          },
        ],
      },
    ];
    const newFilters = [
      {
        label: 'content',
        values: ['interesting'],
      },
    ];

    component.ngOnInit();
    const valueBeforeChange = component.filteredData.length;

    component.infoLabelFilters = newFilters;
    component.ngOnChanges({
      infoLabelFilters: {
        previousValue: component.infoLabelFilters,
        currentValue: newFilters,
        firstChange: false,
        isFirstChange(): boolean {
          return false;
        },
      },
    });

    expect(valueBeforeChange).toBe(2);
    expect(component.filteredData.length).toBe(1);
  });

  describe('onInputChange', () => {
    it('should emit change', () => {
      const searchQuery = 'Test';
      jest.spyOn(component.inputChanged, 'emit');

      component.onInputChange(searchQuery);

      expect(component.inputChanged.emit).toHaveBeenCalledWith(searchQuery);
      expect(component.searchTerm).toEqual(searchQuery);
    });
  });

  describe('Integration Tests', () => {
    let catalogPagePo: CatalogPagePo;
    let mockData: CatalogDataItem[];

    beforeEach(() => {
      catalogPagePo = new CatalogPagePo(fixture.nativeElement);
      mockData = catalogPagePo.getMockDataItems();
    });

    describe('Header and sub title', () => {
      it('should render the default header title and no description', () => {
        expect(catalogPagePo.getTextContent(catalogPagePo.headerTitle)).toBe(
          'Catalog',
        );
        expect(catalogPagePo.description).toBe(null);
      });

      it('should render the header title and description', () => {
        const mockInputs = {
          title: 'Title',
          subtitle: 'Mock Subitle',
        };
        fixture.componentRef.setInput('title', mockInputs.title);
        fixture.componentRef.setInput('subtitle', mockInputs.subtitle);

        fixture.detectChanges();

        expect(catalogPagePo.getTextContent(catalogPagePo.headerTitle)).toBe(
          mockInputs.title,
        );
        expect(catalogPagePo.getTextContent(catalogPagePo?.description)).toBe(
          mockInputs.subtitle,
        );
      });
    });

    describe('Items', () => {
      it('should display catalog items', () => {
        fixture.componentRef.setInput('data', mockData);
        fixture.detectChanges();

        expect(catalogPagePo.catalogItems.length).toBe(mockData.length);
        Array.from(catalogPagePo.catalogItems).forEach((item, index) => {
          expect(catalogPagePo.getTextContent(item)).toContain(
            mockData[index].title,
          );
        });
      });

      it('should click on catalog items', () => {
        component.itemClicked.emit = jest.fn();
        fixture.componentRef.setInput('data', mockData);
        fixture.detectChanges();

        catalogPagePo.clickCatalogItem(0);
        fixture.detectChanges();

        expect(component.itemClicked.emit).toHaveBeenCalledWith(mockData[0]);
      });
      it('should display the empty catalog message if no items are found', () => {
        const noItems = 'No items found';
        component.filteredData = [];
        fixture.componentRef.setInput('data', []);
        fixture.componentRef.setInput('noItemsFoundTitle', noItems);
        fixture.detectChanges();

        expect(catalogPagePo.catalogItems.length).toBe(0);
        expect(
          catalogPagePo.getTextContent(catalogPagePo?.emptyCatalogMessage),
        ).toBe(noItems);
      });
    });
    describe('Filter', () => {
      it('should not render filter by default', () => {
        expect(catalogPagePo.categoryFilter).toBeNull();
        expect(catalogPagePo.providerFilter).toBeNull();
      });

      it('should display category and filter items', () => {
        jest.spyOn(component, 'setCategoryFilter');
        jest
          .spyOn(CategoriesUtils, 'filterByCategory')
          .mockImplementation((filter, item) => {
            // setup filter for category as custom event is not able to
            filter = {
              category: 'HS2',
              providers: [],
            };
            return item.category === filter.category;
          });

        fixture.componentRef.setInput('filterHeader', true);
        fixture.componentRef.setInput('data', mockData);
        fixture.detectChanges();

        catalogPagePo.selectCategoryFilter();
        fixture.detectChanges();

        expect(catalogPagePo.categoryFilter).toBeTruthy();
        expect(component.setCategoryFilter).toHaveBeenCalledTimes(1);
        expect(component.filteredData.length).toBe(1);
        expect(component.filteredData[0].title).toBe(mockData[1].title);
      });

      it('should filter items by provider', () => {
        jest.clearAllMocks();
        jest.spyOn(component, 'setProvidersFilter');
        jest
          .spyOn(ProvidersUtils, 'filterByProviders')
          .mockImplementation((filter, item) => {
            // setup filter for provider as custom event is not able to
            filter = {
              providers: [{ id: '1', label: 'HS' }],
            };
            return item.provider === filter.providers[0].label;
          });

        fixture.componentRef.setInput('filterHeader', true);
        fixture.componentRef.setInput('data', mockData);
        component.filteredData = mockData;
        fixture.detectChanges();

        catalogPagePo.selectProviderFilter();
        fixture.detectChanges();

        expect(catalogPagePo.providerFilter).toBeTruthy();
        expect(component.setProvidersFilter).toHaveBeenCalledTimes(1);
        expect(component.filteredData.length).toBe(1);
      });
    });

    describe('Search', () => {
      it('should hide search when disableSearch', () => {
        fixture.componentRef.setInput('disableSearch', true);
        fixture.detectChanges();

        expect(catalogPagePo.searchField).toBeNull();
      });

      it('should filter items by search term', () => {
        catalogPagePo.submitSearch();
        fixture.detectChanges();

        expect(catalogPagePo.searchField).not.toBeNull();
      });
    });
  });
});
