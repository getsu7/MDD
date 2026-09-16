import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  @Input() public showNav = true;

  public menuOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public openMenu(): void {
    this.menuOpen = true;
  }

  public closeMenu(): void {
    this.menuOpen = false;
  }

  public logout(): void {
    this.closeMenu();
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}

