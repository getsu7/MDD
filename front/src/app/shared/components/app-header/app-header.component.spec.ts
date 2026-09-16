import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services';
import { SharedModule } from '../../shared.module';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it('devrait ouvrir puis fermer le menu mobile', () => {
    expect(component.menuOpen).toBeFalse();
    component.openMenu();
    expect(component.menuOpen).toBeTrue();
    component.closeMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('devrait se déconnecter et naviguer vers l’accueil au clic sur "Se déconnecter"', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.menuOpen).toBeFalse();
  });

  it('ne devrait pas afficher la navigation quand showNav est faux', () => {
    component.showNav = false;
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.app-header__nav');
    expect(nav).toBeNull();
  });
});
