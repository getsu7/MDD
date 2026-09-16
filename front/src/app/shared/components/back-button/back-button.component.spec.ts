import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared.module';
import { BackButtonComponent } from './back-button.component';

describe('BackButtonComponent', () => {
  let component: BackButtonComponent;
  let fixture: ComponentFixture<BackButtonComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BackButtonComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it("devrait revenir en arrière quand un historique de navigation existe", () => {
    spyOnProperty(window.history, 'length').and.returnValue(2);
    spyOn(location, 'back');

    component.goBack();

    expect(location.back).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("devrait naviguer vers la route de repli quand aucun historique n'existe", () => {
    spyOnProperty(window.history, 'length').and.returnValue(1);

    component.fallback = '/articles';
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/articles']);
  });
});
