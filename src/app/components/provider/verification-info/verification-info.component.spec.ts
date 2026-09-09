import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationInfoComponent } from './verification-info.component';
import { VerificationInfo } from 'models/verification-info';

describe('VerificationInfoComponent', () => {
  let component: VerificationInfoComponent;
  let fixture: ComponentFixture<VerificationInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerificationInfoComponent],
    });

    fixture = TestBed.createComponent(VerificationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const setVerification = (info: VerificationInfo | undefined) => {
    fixture.componentRef.setInput('verificationInfo', info);
    fixture.detectChanges();
  };

  const objectStatus = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[fd-object-status]');

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing when no verification info is provided', () => {
    setVerification(undefined);
    expect(objectStatus()).toBeNull();
  });

  it('renders the object status when verification info is provided', () => {
    setVerification({ label: 'Verified', status: 'positive' });
    expect(objectStatus()).not.toBeNull();
  });

  it('uses the icon from the data when provided', () => {
    setVerification({ label: 'Certified', status: 'positive', icon: 'accept' });
    expect(objectStatus()?.querySelector('.sap-icon--accept')).not.toBeNull();
  });

  it('falls back to the verified glyph when no icon is provided', () => {
    setVerification({ label: 'Verified', status: 'positive' });
    expect(objectStatus()?.querySelector('.sap-icon--verified')).not.toBeNull();
  });
});
