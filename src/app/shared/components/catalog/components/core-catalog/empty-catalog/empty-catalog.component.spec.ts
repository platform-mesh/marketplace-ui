import { EmptyCatalogComponent } from './empty-catalog.component';
import { EmptyCatalogPo } from './empty-catalog.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('EmptyCatalogComponent', () => {
  let fixture: ComponentFixture<EmptyCatalogComponent>;
  let component: EmptyCatalogComponent;
  let emptyCatalogPo: EmptyCatalogPo;

  const mockProjectedContent = '<div></div>';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyCatalogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyCatalogComponent);
    component = fixture.componentInstance;
    emptyCatalogPo = new EmptyCatalogPo(fixture.nativeElement);
    component.title = 'Sample Title';

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(emptyCatalogPo.illustratedMessage).toBeTruthy();
  });

  it('should render the title input', () => {
    expect(emptyCatalogPo.getTextContent(emptyCatalogPo.title)).toBe(
      'Sample Title',
    );
  });

  it('should pass the correct sceneConfig to the illustrated message', () => {
    expect(emptyCatalogPo.illustratedMessage).toBeTruthy();
    expect(component.sceneConfig).toEqual({
      scene: {
        url: './assets/sapIllus-Scene-NoSearchResults.svg',
        id: 'sapIllus-Scene-NoSearchResults',
      },
      dialog: {
        url: './assets/sapIllus-Dialog-NoSearchResults.svg',
        id: 'sapIllus-Dialog-NoSearchResults',
      },
    });
  });

  it('should render projected content in the fd-illustrated-message-actions', () => {
    fixture.nativeElement
      .querySelector('fd-illustrated-message-actions')
      .insertAdjacentHTML('beforeend', mockProjectedContent);

    fixture.detectChanges();

    expect(emptyCatalogPo.actions.innerHTML).toContain(mockProjectedContent);
  });
});
