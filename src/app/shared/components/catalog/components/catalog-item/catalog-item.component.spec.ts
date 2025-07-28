import { CatalogDataItem } from '../../models';
import { CatalogItemComponent } from './catalog-item.component';
import { CatalogItemComponentPo } from './catalog-item.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';

const badgeColor = 'red';
const item = mock<CatalogDataItem>({
  badge: {
    color: badgeColor,
  },
  labels: [{ color: '1', title: 'Beta' }],
  additionalInfo: [],
});

describe('CatalogItemComponent', () => {
  let component: CatalogItemComponent;
  let fixture: ComponentFixture<CatalogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('data', item);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should ensure badge', () => {
    fixture.componentRef.setInput('data', item);

    fixture.detectChanges();
    const badge = mock<HTMLElement>();
    component['elementRef'].nativeElement.querySelector = jest
      .fn()
      .mockReturnValue(badge);

    component['ensureBadge']();

    expect(
      component['elementRef'].nativeElement.querySelector,
    ).toHaveBeenCalledWith('.fd-badge');
    expect(badge.style.backgroundColor).toEqual(badgeColor);
    expect(badge.tabIndex).toEqual(-1);
  });

  describe('integration tests', () => {
    let mockItem: CatalogDataItem;
    let catalogItemComponentPo: CatalogItemComponentPo;

    describe('when catalog item has data', () => {
      beforeEach(() => {
        catalogItemComponentPo = new CatalogItemComponentPo(
          fixture.nativeElement,
        );
        mockItem = catalogItemComponentPo.getMockDataItem();
        fixture.componentRef.setInput('data', mockItem);

        fixture.detectChanges();
      });

      it('should display the title and description correctly', () => {
        expect(
          catalogItemComponentPo.getTextContent(
            catalogItemComponentPo.cardTitle,
          ),
        ).toContain(mockItem.title);
        expect(
          catalogItemComponentPo.getTextContent(
            catalogItemComponentPo.cardDescription,
          ),
        ).toBe(mockItem.description);
      });

      it('should display all labels', () => {
        const labels = Array.from(catalogItemComponentPo.infoLabels).map(
          (label) => catalogItemComponentPo.getTextContent(label),
        );
        expect(labels).toEqual(mockItem.labels?.map((label) => label.title));
      });

      it('should render the avatar with the correct id', () => {
        const generatedId = component.generateId();
        expect(catalogItemComponentPo.avatar).toBeTruthy();
        expect(catalogItemComponentPo.avatar.getAttribute('id')).toBe(
          generatedId,
        );
      });

      it('should render badge', () => {
        expect(catalogItemComponentPo.badge).toBeTruthy();
        expect(
          catalogItemComponentPo.getTextContent(catalogItemComponentPo.badge!),
        ).toBe(mockItem.badge?.text);
      });

      it('should display additional information correctly', () => {
        const additionalInfo = catalogItemComponentPo.getAdditionalInfoText();
        expect(additionalInfo).toEqual(mockItem.additionalInfo);
      });

      it('should display provider verification if verification exists', () => {
        expect(catalogItemComponentPo.providerVerification).toBeTruthy();
      });
    });

    describe('when catalog item has limited data', () => {
      beforeEach(() => {
        catalogItemComponentPo = new CatalogItemComponentPo(
          fixture.nativeElement,
        );
        mockItem = catalogItemComponentPo.getLimitedMockDataItem();

        fixture.componentRef.setInput('data', mockItem);

        fixture.detectChanges();
      });

      it('should not display provider verification if verification is undefined', () => {
        expect(catalogItemComponentPo.providerVerification).toBeNull();
      });

      it('should not display additional information', () => {
        const additionalInfo = catalogItemComponentPo.getAdditionalInfoText();
        expect(additionalInfo).toEqual([]);
      });

      it('should display no labels', () => {
        expect(catalogItemComponentPo.infoLabels.length).toBe(0);
      });
    });
  });
});
