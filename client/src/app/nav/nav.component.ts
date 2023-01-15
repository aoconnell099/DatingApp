import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  backgrounds = new FormControl('');
  backgroundList: string[] = ['Original', 'Wave'];
  font = 'Work Sans'
  fonts = new FormControl('');
  fontList: string[] = ['A Gentle Kiss', 'Kells', 'Lieselotte', 'Meath', 'Remachine'];
  backgroundToggle = true;
  background = 'Gray'
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  isActive = false;
  readonly breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
    .pipe(
      tap(value => console.log(value)),
      distinctUntilChanged()
    );
  model: any = {};

  // displayNameMap = new Map([
  //   [Breakpoints.XSmall, 'XSmall'],
  //   [Breakpoints.Small, 'Small'],
  //   [Breakpoints.Medium, 'Medium'],
  //   [Breakpoints.Large, 'Large'],
  //   [Breakpoints.XLarge, 'XLarge'],
  // ]);

  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService, private breakpointObserver: BreakpointObserver) { 
    // breakpointObserver
    //   .observe([
    //     Breakpoints.XSmall,
    //     Breakpoints.Small,
    //     Breakpoints.Medium,
    //     Breakpoints.Large,
    //     Breakpoints.XLarge,
    //   ])
    //   .pipe()
    //   .subscribe(result => {
    //     for (const query of Object.keys(result.breakpoints)) {
    //       if (result.breakpoints[query]) {
    //         // Put page change logic here
    //       }
    //     }
    //   });
  }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
    //this.logout();
  }

  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if(this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.currentBreakpoint = Breakpoints.XSmall;
    }
  }

  login() {
    this.accountService.login(this.model).subscribe(response => {
      this.router.navigateByUrl('/members');
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  toggleElevation(event: any) {
    // Check if the button is not elevated
    if (event.target.classList.contains('mat-elevation-z2')) {
      event.target.classList.add('mat-elevation-z8');
      event.target.classList.remove('mat-elevation-z2');
    }
    else if (event.target.classList.contains('mat-elevation-z8')) {
      event.target.classList.add('mat-elevation-z2');
      event.target.classList.remove('mat-elevation-z8');
    }
  }

  toggleBackground(event: MatSlideToggleChange) {
    console.log(event);
    this.backgroundToggle = !this.backgroundToggle;
    this.background = this.backgroundToggle ? 'Gray' : 'Wave';
  }
  // toggleBackground() {
  //   this.backgroundToggle = !this.backgroundToggle;
  //   this.background = this.backgroundToggle ? 'Gray' : 'Wave';
  // }
}
