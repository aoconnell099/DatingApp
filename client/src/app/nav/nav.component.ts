import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FormControl } from '@angular/forms';
import { MatSelectionListChange, SelectionList } from '@angular/material/list';
import { MatRadioChange } from '@angular/material/radio';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../modals/login-dialog/login-dialog.component';
import { ConfirmLogoutComponent } from '../modals/confirm-logout/confirm-logout.component';
import { MatSidenav } from '@angular/material/sidenav';
//import { animate, transition } from '@angular/material/animations';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @ViewChild('loginMenu') loginMenu!: MatMenu;
  @ViewChild('loginTrigger') loginTrigger!: MatMenuTrigger;
  @ViewChild('userImgTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  backgroundToggle = true;

  background = 'Original';
  backgroundList: string[] = ['Original', 'Wave', 'Stained', 'Drowning Girl', 'Beeple'];
  currentBackground ='';
  currentFont = '';
  font = 'Roboto';
  fontList: string[] = ['Roboto', 'A Gentle Touch', 'Kells', 'Lieselotte', 'Meath', 'Remachine'];
  title = 'Dating App';
  currentTitle = '';
  titleList = ['Dating App', 'Fiddler', 'Amhrán'];

  toggleFade = false;
  
  logoChar = '';

  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  mobileBreakpoint = '';
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 400px)'
  isActive = false;
  hide = true;

  readonly breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, this.landscapeBreakpoint])
    .pipe(
      tap(), //value => console.log(value)
      distinctUntilChanged()
    );
  model: any = {};

  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService, 
    private breakpointObserver: BreakpointObserver, public loginDialog: MatDialog, public confirmLogoutDialog: MatDialog) {}

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
    this.initVars();
  }

  testButton($event: any) {
    console.log("button pressed");
  }
  ngAfterContentInit(): void {
    this.onFontChange();
  }

  openLoginDialog(): void {
    const dialogRef = this.loginDialog.open(LoginDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      // console.log(result);
    });
  }

  openLogoutConfirmDialog(): void {
    const dialogRef = this.confirmLogoutDialog.open(ConfirmLogoutComponent);

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      // console.log(result);
    });
  }

  closeOnLogin() {
    //console.log(this.loginTrigger);
    this.loginTrigger.closeMenu();
  }
  private async closeMenu() {
    //console.log(this.menuTrigger);
    this.menuTrigger.closeMenu();
  }
  
  private initVars() {
    this.currentFont = document.getElementById("nav-title")  != null ? document.getElementById("nav-title")!.style.fontFamily : this.font;
    this.currentBackground = this.background;
    this.currentTitle = this.title;
    this.logoChar = this.title.charAt(0);
  }
  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.XLarge)) {
      this.currentBreakpoint = Breakpoints.XLarge;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if(this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.currentBreakpoint = Breakpoints.XSmall;
    }

    if (this.breakpointObserver.isMatched(this.landscapeBreakpoint)) {
      this.mobileBreakpoint = this.landscapeBreakpoint;
    }
    else {
      this.mobileBreakpoint = '';
    }
    console.log(this.mobileBreakpoint);
  }

  login() {
    // console.log(this.model.username);
    // console.log(this.model.password);
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

  onSidenavClose() {
    //console.log('sidenavclose');
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  }

  toggleBackground(event: MatSlideToggleChange) {
    this.backgroundToggle = !this.backgroundToggle;
    this.background = this.backgroundToggle ? 'Gray' : 'Wave';
  }

  onBackgroundChange(event: MatSelectionListChange, value: any) {
    //console.log(event);
    this.background = value[0].value != null ? value[0].value : 'Original';
    this.currentBackground = this.background;
  }

  onTitleChange(event: MatSelectionListChange, value: any) {
    //console.log(event);
    this.title = event.options[0].value != null ? event.options[0].value : 'Dating App';
    this.currentTitle = this.title;
    this.logoChar = this.title.charAt(0);
  }

  // onFontChange((event?: MatSelectionListChange) => {
  //   var currTit = this.title;
  //   this.title = '';
  //   this.toggleFade = !this.toggleFade;
  //   await this.delay(500);
  //   this.title = currTit;
  //   this.toggleFade = !this.toggleFade;

  //   this.font = event?.options[0].value != null ? event.options[0].value : 'Roboto';
  //   console.log(this.font);
  //   this.currentFont = this.font;
  //   console.log(this.currentFont})
  // }
  async onFontChange(event?: MatSelectionListChange) {
    var currTit = this.title;
    this.title = '';
    this.toggleFade = !this.toggleFade;
    await this.delay(500);
    this.title = currTit;
    this.toggleFade = !this.toggleFade;

    this.font = event?.options[0].value != null ? event.options[0].value : 'Roboto';
    //console.log(this.font);
    this.currentFont = this.font;
    //console.log(this.currentFont);
  }
  // const onFontChange = async (event?: MatSelectionListChange) => {
  //   var currTit = this.title;
  //   this.title = '';
  //   this.toggleFade = !this.toggleFade;
  //   await this.delay(500);
  //   this.title = currTit;
  //   this.toggleFade = !this.toggleFade;

  //   this.font = event?.options[0].value != null ? event.options[0].value : 'Roboto';
  //   console.log(this.font);
  //   this.currentFont = this.font;
  //   console.log(this.currentFont);
  // };

  // newFontChange(() => {
  //   onFontChange();
  // });
}

    // switch (this.currentFont) {
    //   case "Roboto":
    //     console.log("Roboto");
    //     break;
    //   case "A Gentle Touch":
    //     console.log("A Gentle Touch");
    //     break;
    //   case "Kells":
    //     console.log("Kells");
    //     break;
    //   case "Lieselotte":
    //     console.log("Lieselotte");
    //     break;
    //   case "Meath":
    //     console.log("Meath");
    //     break;
    //   case "Remachine":
    //     console.log("Remachine");
    //     break;
    // }

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
    
  // displayNameMap = new Map([
  //   [Breakpoints.XSmall, 'XSmall'],
  //   [Breakpoints.Small, 'Small'],
  //   [Breakpoints.Medium, 'Medium'],
  //   [Breakpoints.Large, 'Large'],
  //   [Breakpoints.XLarge, 'XLarge'],
  // ]);
