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
import { argbFromHex, themeFromSourceColor, applyTheme } from "@material/material-color-utilities";


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

  background = 'Bg-8';
  backgroundList: string[] = ['Original', 'Wave', 'Stained', 'Drowning Girl', 'Beeple', 'Bg-1', 'Bg-2', 'Bg-3', 'Bg-4', 'Bg-5', 'Bg-6', 'Bg-7', 'Bg-8', 'Bg-9', 'Bg-10'];
  currentBackground ='';
  currentFont = '';
  currentEffect = 'None'
  effect = 'None';
  effectList: string[] = ['None', 'Bubbles', 'Orbs', 'Particles'];
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
    const theme = themeFromSourceColor(argbFromHex('#f82506'), [
      {
        name: "custom-1",
        value: argbFromHex("#ff0000"),
        blend: true,
      },
    ]);
     
    // Print out the theme as JSON
    console.log("NAV_COMPONENT");
    console.log(JSON.stringify(theme, null, 2));
    //console.log(theme.primary)
    
    // Check if the user has dark mode turned on
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Apply the theme to the body by updating custom properties for material tokens
    applyTheme(theme, {target: document.body, dark: systemDark});

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    let tb = document.getElementById("toolbar")?.clientHeight! * 0.01
    let vw = window.innerWidth * 0.01;
    let ang = Math.atan((vw*1.2)/((vh-tb) * .18)) * (180/Math.PI);
    let angSmall = Math.atan((vw*2.5)/((vh-tb) * .22)) * (180/Math.PI);
    let angMed = Math.atan((vw*1.7)/((vh-tb) * .18)) * (180/Math.PI);
    let grad = document.getElementById("gradient");
    let gradHeight = grad?.clientHeight! * 0.01;
    let currentScrollHeight = document.getElementById('prof-outer')?.scrollTop;
    let op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
    document.documentElement.style.setProperty('--op', `${op}`);
    console.log(op);
    console.log(gradHeight);
    console.log(tb);

    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--tb', `${tb}px`);
    document.documentElement.style.setProperty('--ang', `${ang}deg`);
    document.documentElement.style.setProperty('--angSmall', `${angSmall}deg`);
    document.documentElement.style.setProperty('--angMed', `${angMed}deg`);
    document.documentElement.style.setProperty('--gh', `${gradHeight}px`);
    // We listen to the resize event
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      let tb = document.getElementById("toolbar")?.clientHeight! * 0.01
      let vw = window.innerWidth * 0.01;
      //let ang = Math.atan((vw*100)/(((vh*100)-(tb*100)) - (vh*82)));
      let ang = Math.atan((vw*1.2)/((vh-tb) * .18)) * (180/Math.PI);
      let angSmall = Math.atan((vw*2.5)/((vh-tb) * .22)) * (180/Math.PI);
      let angMed = Math.atan((vw*1.7)/((vh-tb) * .18)) * (180/Math.PI);
      let gradHeight = document.getElementById("gradient")?.clientHeight! * 0.01;
      let currentScrollHeight = document.getElementById('prof-outer')?.scrollTop;
      let op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
    
      console.log(vh);
      console.log(tb);
      console.log(vw);
      console.log(ang);
      console.log(op);
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--tb', `${tb}px`);
      document.documentElement.style.setProperty('--ang', `${ang}deg`);
      document.documentElement.style.setProperty('--angSmall', `${angSmall}deg`);
      document.documentElement.style.setProperty('--angMed', `${angMed}deg`);
      document.documentElement.style.setProperty('--gh', `${gradHeight}px`);
      document.documentElement.style.setProperty('--op', `${op}`);
    });

    window.addEventListener('scroll', () => {
      console.log('scroll');
      let gradHeight = document.getElementById("gradient")?.clientHeight! * 0.01;
      let currentScrollHeight = document.getElementById('prof-outer')?.scrollTop;
      console.log(gradHeight);
      console.log(currentScrollHeight);
      let op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
      console.log(op);
      document.documentElement.style.setProperty('--op', `${op}`);
    });
    
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
    console.log('login');
    this.accountService.login(this.model).subscribe(response => {
      console.log('login log');
      console.log(localStorage.getItem('user'));
      this.router.navigateByUrl('/members');
      
    });
    
  }

  logout() {
    console.log('logout');
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
    this.background = value[0].value != null ? value[0].value : 'Bg-8';
    this.currentBackground = this.background;
  }
  onEffectChange(event: MatSelectionListChange, value: any) {
    //console.log(event);
    this.effect = value[0].value != null ? value[0].value : 'None';
    this.currentEffect = this.effect;
  }

  onTitleChange(event: MatSelectionListChange, value: any) {
    //console.log(event);
    this.title = event.options[0].value != null ? event.options[0].value : 'Dating App';
    this.currentTitle = this.title;
    this.logoChar = this.title.charAt(0);
  }

  numSequence(n: number): Array<number> { 
    return Array(n); 
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
