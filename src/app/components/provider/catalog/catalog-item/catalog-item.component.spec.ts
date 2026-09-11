import { CatalogItemComponent } from './catalog-item.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogDataItem } from 'models/index';

const buildItem = (
  overrides: Partial<CatalogDataItem> = {},
): CatalogDataItem => ({
  title: 'Test Provider',
  description: 'A test provider description',
  badge: { text: 'INSTALLED', status: 'positive' },
  labels: [{ color: '1', title: 'Beta' }],
  additionalInfo: [{ label: 'Category', value: 'AI' }],
  verification: { label: 'Community', status: 'neutral' },
  image: 'https://example.com/icon.png',
  ...overrides,
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
    fixture.componentRef.setInput('data', buildItem());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('generateId', () => {
    it('should return MD5 hash of image when image is set', () => {
      fixture.componentRef.setInput(
        'data',
        buildItem({ image: 'https://example.com/icon.png', glyph: undefined }),
      );
      fixture.detectChanges();
      const id = component.generateId();
      expect(id).toBeTruthy();
      expect(id).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should return glyph when no image is set but glyph is set', () => {
      fixture.componentRef.setInput(
        'data',
        buildItem({ image: undefined, glyph: 'sap-icon://accept' }),
      );
      fixture.detectChanges();
      expect(component.generateId()).toBe('sap-icon://accept');
    });

    it('should return "no-icon" when neither image nor glyph is set', () => {
      fixture.componentRef.setInput(
        'data',
        buildItem({ image: undefined, glyph: undefined }),
      );
      fixture.detectChanges();
      expect(component.generateId()).toBe('no-icon');
    });
  });
});
