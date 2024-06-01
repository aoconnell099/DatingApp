import { AfterViewInit, ApplicationRef, Component, ContentChildren, DoCheck, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
//import { Pagination } from 'src/app/_models/paginations';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
//import { MatGridList } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSelectionListChange } from '@angular/material/list';
// import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
// import { IonicSlides } from '@ionic/angular';
import { Gesture, GestureController, GestureDetail, Animation, AnimationController } from '@ionic/angular';
import { MemberCardComponent } from '../member-card/member-card.component';
import { IonicMemberCardComponent } from '../ionic-member-card/ionic-member-card.component';
import { Element } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';
import {MatExpansionModule} from '@angular/material/expansion';
//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchDialogComponent } from 'src/app/modals/match-dialog/match-dialog.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-ionic-member-list',
  templateUrl: './ionic-member-list.component.html',
  styleUrls: ['./ionic-member-list.component.scss'],
  animations: [
	  trigger('visibleHidden', [
		state(
			'visible',
			style({
				transform: 'translate(1%, 1%) scale(1)',
				opacity: 1,
			})
		),
		state(
			'void, hidden',
			style({
				transform: 'translate(0%, 0%) scale(0.5)',
				opacity: 0,
			})
		),
		transition('* => visible', animate('2000ms')),
		transition('* => void, * => hidden', animate('1000ms'))
	  ]),
	],
})
export class IonicMemberListComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number; }; }) {
    this.windowWidth = event.target.innerWidth;
    console.log('onResize event');
    console.log(event);
    //console.log(this.windowWidth);
  }
  @ViewChild('cardCont') cardCont!: ElementRef<any>;
  @ViewChild('dislikeCont') dislikeCont!: ElementRef<any>;
  @ViewChild('likeCont') likeCont!: ElementRef<any>;
  @ViewChild('memberCard') memberCard!: IonicMemberCardComponent;
  @ViewChildren(IonicMemberCardComponent, { read: ElementRef }) cardElRefs!: QueryList<ElementRef>
  @ViewChildren(IonicMemberCardComponent) cardCompRefs!: QueryList<IonicMemberListComponent>

  eventsSubject: Subject<void> = new Subject<void>();
  
  members: Member[] = [];
  matches: any = [];
  remainingMatches: any = [];
  remainingCards: number = 0;
  ages: number[] = [];
  selectedMember?: Member;
  pagination?: any;
  userParams?: UserParams;
  //user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}, {value: 'both', display: 'Both'}];
  panelOpenState = false;

  numberOfCols?: number;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  mobileBreakpoint = '';
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 450px)';
  largeBreakpoint = '(min-width: 1280px) and (max-width: 1749.98px)';
  xLargeBreakpoint = '(min-width: 1750px)';
  rowHeightRatio = "1:1.5";

  selected = 'lastActive';

  windowWidth = window.innerWidth;

  concertFilter = false;
  distance?: number;

  userLoc?: any;

  isLoading=false;
  cont: any;
  cardContainer: any; 
  shouldLike?:boolean;

  isMatchDialogVisible = false;
  


  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint, this.largeBreakpoint, this.xLargeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)  Unnecessary
    distinctUntilChanged()
  );

  constructor(private memberService: MembersService, private breakpointObserver: BreakpointObserver,
      private gestureCtrl: GestureController, private animationCtrl: AnimationController,
      private toastr: ToastrService, private ref: ChangeDetectorRef, private appRef: ApplicationRef,
    public matchDialog: MatDialog, public accountService: AccountService) { 
    this.userParams = this.memberService.getUserParams();
    this.cont = document.getElementById('sidenavContent');
    
    
  }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged() 
    );
    console.log(this.cardCont);
    this.cardContainer = document.getElementById('cardCont');
    console.log(this.cardContainer);
    for (let i=18; i<100; i++) {
      this.ages.push(i);
    }
    //this.loadMatches();
    this.userLoc = navigator.geolocation.getCurrentPosition(position => {
      if(this.userParams) {
        console.log('position');
        console.log(position);
        this.userParams.latitude = position.coords.latitude;
        this.userParams.longitude = position.coords.longitude;
        this.memberService.setUserParams(this.userParams);
      }
      
    });
    this.loadMatches();    
  }

  ngOnChanges(): void {
    //console.log("onChanges");
  }
  ngDoCheck(): void {
    //console.log("doCheck");
    // if (this.remainingCards === 0) {
    //   this.onScroll();
    // }
  }

  ngAfterViewInit(): void {
    //console.log("afterViewInit");
  }
  ngAfterContentInit(): void {
    //console.log("afterContentInit");
  }
  ngAfterContentChecked(): void {
   // console.log("afterContentChecked");
  }

  emitEventToChild() {
    this.eventsSubject.next();
  }

  ngAfterViewChecked(): void {
    //console.log("afterviewchecked");
    this.cardElRefs.forEach((memberCard: any, index: number) => {
      // memberCard.nativeElement.addEventListener("transitionend", () => {
      //   //console.log("TEST");
      // });      
      let gesture = this.gestureCtrl.create({
        el: memberCard.nativeElement,
        threshold: 0,
        gestureName: 'my-gesture',
        onStart: () => {
          memberCard.nativeElement.style.transition = 'none';
        },
        onMove: (detail) => { 
          memberCard.nativeElement.style.transform = `translateX(${detail.deltaX}px) rotate(${detail.deltaX / 20}deg)`;
          if (detail.deltaX > 0) {
            this.likeCont.nativeElement.style.opacity = detail.deltaX / 120;
          } else if (detail.deltaX < 0) {
            this.dislikeCont.nativeElement.style.opacity = detail.deltaX / -120;
          }
        },
        onEnd: (detail) => {
          //
          memberCard.nativeElement.style.transition = '0.3s ease-out';
          this.likeCont.nativeElement.style.transition = 'opacity 0.5s ease-out';
          this.dislikeCont.nativeElement.style.transition = 'opacity 0.5s ease-out';
          console.log(detail.deltaX);
          if (detail.deltaX > this.windowWidth / 2.5) {
            //memberCard.nativeElement.style.transform = `translateX(${this.windowWidth * 1.5}px)`;
            this.animateLikeDislike(this.likeCont);
            this.likeCont.nativeElement.style.opacity = 0; // This runs before the animation completes but looks good so leave for now.
            
            if (this.selectedMember) {
              // setTimeout(()=>this.addLike(this.selectedMember!), 0);
              //this.addLike(this.selectedMember);
              //this.appRef.tick();
              //document.getElementById("addLike")?.click();
              console.log(this.memberCard);
              //this.memberCard.addLike(this.selectedMember)  //addLike(this.selectedMember);
              //this.shouldLike = true;
              console.log(this.selectedMember.id);
              console.log(document.querySelector("#addLike-"+this.selectedMember.id));
              console.log(document.getElementById("#addLike-"+this.selectedMember.id));
              //document.querySelector("#addLike")?.click();

              let butt: HTMLElement = document.getElementById("addLike-"+this.selectedMember.id) as HTMLElement;
              butt.click();
            }
            memberCard.nativeElement.ontransitionend = () => {
              //this.shouldLike = false;
              console.log("transitionEnd");
              
              //console.log(document.getElementById("cardCont")?.children.length);
              // if (document.getElementById("cardCont")?.children.length === 2) {
              //   this.onScroll();
              // }
              memberCard.nativeElement.remove();
              //console.log(document.getElementById("cardCont")?.children.length);

              // if (document.getElementById("cardCont")?.children.length === 0) {
              //   // this.onScroll();
              //   if (this.userParams && this.pagination) {
              //     if (this.userParams?.pageNumber < this.pagination?.totalPages - 1) {
              //       console.log(this.userParams);
              //       this.userParams.pageNumber++;
              //       this.memberService.setUserParams(this.userParams);
              //       this.loadMatches();
            
              //     }
              //   }
              // }
              // this.remainingMatches.shift();
              this.remainingCards--;
              console.log(this.remainingCards);
              if (this.remainingCards === 0) {
                this.onScroll();
              }
              // else {
              //   memberCard.nativeElement.remove();
              // }
              //this.ngDoCheck();
              //this.ref.detectChanges();
            } 
            //memberCard.nativeElement.remove();
          } else if (detail.deltaX < -this.windowWidth / 2.5) {
            //memberCard.nativeElement.style.transform = `translateX(-${this.windowWidth * 1.5}px)`
            this.animateLikeDislike(this.dislikeCont);
            //this.dislikeCont.nativeElement.style.transform = 'scale(1.2)';
            this.dislikeCont.nativeElement.style.opacity = 0;
            if (this.selectedMember) {
              // setTimeout(()=>this.addLike(this.selectedMember!), 0);
              //this.addLike(this.selectedMember);
              //this.appRef.tick();
              //document.getElementById("addLike")?.click();
              console.log(this.memberCard);
              //this.memberCard.addLike(this.selectedMember)  //addLike(this.selectedMember);
              //this.shouldLike = true;
              console.log(this.selectedMember.id);
              console.log(document.querySelector("addDislike-"+this.selectedMember.id));
              console.log(document.getElementById("addDislike-"+this.selectedMember.id));
              //document.querySelector("#addLike")?.click();

              let butt: HTMLElement = document.getElementById("addDislike-"+this.selectedMember.id) as HTMLElement;
              butt.click();
            }
            //emit event or like the user
            memberCard.nativeElement.ontransitionend = () => {
              console.log("transitionEnd");
              
              //console.log(document.getElementById("cardCont")?.children.length);
              // if (document.getElementById("cardCont")?.children.length === 2) {
              //   this.onScroll();
              // }
              memberCard.nativeElement.remove();
              //console.log(document.getElementById("cardCont")?.children.length);
              // if (document.getElementById("cardCont")?.children.length === 0) {
              //     // this.onScroll();
              //     if (this.userParams && this.pagination) {
              //       if (this.userParams?.pageNumber < this.pagination?.totalPages - 1) {
              //         console.log(this.userParams);
              //         this.userParams.pageNumber++;
              //         this.memberService.setUserParams(this.userParams);
              //         this.loadMatches();
              
              //       }
              //     }
              //   }
              // this.remainingMatches.shift();
              this.remainingCards--;
              console.log(this.remainingCards);
              if (this.remainingCards === 0) {
                this.onScroll();
              }
              // else {
              //   memberCard.nativeElement.remove();
              // }
              //this.ngDoCheck();
              //this.ref.detectChanges();
            } 
          } else {
            memberCard.nativeElement.style.transform = '';
            this.likeCont.nativeElement.style.opacity = 0;
            this.dislikeCont.nativeElement.style.opacity = 0;
          }
          console.log(memberCard);
          console.log(this.selectedMember);
          // this.likeCont.nativeElement.style.transform = 'scale(1)';
          // this.dislikeCont.nativeElement.style.transform = 'scale(1)';
          // console.log(document.getElementById("cardCont")?.children.length);
          // if (document.getElementById("cardCont")?.children.length === 1) {
          //   this.onScroll();
          // }
          console.log(this.matches);
          // this.ref.detectChanges();
          // this.ngDoCheck();
        }
        
      });
      gesture.enable();
    });

    //let cardContainer = document.getElementById('cardContainer');
    // let height = 0; 
    // let children = cardCont?.children;
    // height = children[0]?.style.offsetHeight;
    // console.log(cardContainer);
    // console.log(cardContainer?.style.display);
    // console.log(this.cardCont.nativeElement);
    // console.log(this.cardCont.nativeElement.style);
    // //console.log(this.cardCont.nativeElement.children[0].nativeElement); //.style.offsetHeight
    // console.log(this.cardCont.nativeElement.children[0].style.height); //.style.offsetHeight
    //this.cardCont.nativeElement.style.height = this.cardCont.nativeElement.children[0].style.offsetHeight;
  }

  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(this.xLargeBreakpoint)) {
      this.currentBreakpoint = this.xLargeBreakpoint;
    } else if(this.breakpointObserver.isMatched(this.largeBreakpoint)) {
      this.currentBreakpoint = this.largeBreakpoint;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if(this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.currentBreakpoint = Breakpoints.XSmall;
    } 

    if (this.breakpointObserver.isMatched(this.landscapeBreakpoint)) {
      //this.currentBreakpoint = this.landscapeBreakpoint;
      this.mobileBreakpoint = this.landscapeBreakpoint;
      console.log('my landscape');
    }
    else {
      this.mobileBreakpoint = '';
      console.log('no landscape');
    }
    
    if(this.currentBreakpoint === Breakpoints.XLarge || this.currentBreakpoint === Breakpoints.Large) {
      this.numberOfCols = 3;
      this.rowHeightRatio = "1:1.3"
    } else if(this.currentBreakpoint === Breakpoints.Medium || this.currentBreakpoint === Breakpoints.Small) {
      this.numberOfCols = 2;
      this.rowHeightRatio = "1:1.2"
    } else if(this.currentBreakpoint === Breakpoints.XSmall) {
      this.numberOfCols = 1;
      this.rowHeightRatio = "1:1.1"
    }
  }

  toggleLoading = ()=>this.isLoading=!this.isLoading;

  loadMembers() {
    if (this.userParams) {
      this.toggleLoading();
      this.userParams.concertFilter = this.concertFilter;
      console.log('load');
      console.log(this.userParams);
      this.memberService.setUserParams(this.userParams);
      console.log(this.userParams);
      this.memberService.getMatches(this.userParams).subscribe({
        next: response => {
          console.log(response);
          console.log(response.result);
          console.log(response.pagination);
          if (response.result && response.pagination) {
            console.log('inside response');
            this.matches = response.result;
            console.log(this.matches);
            this.pagination = response.pagination;
          }
        },
        complete: () => this.toggleLoading()
      }) 
    }
  }

  selectMember(member: Member, event: any) {
    console.log(member);
    console.log(event);
    this.selectedMember = member;
  }

  animateLikeDislike(container: ElementRef<any>) {
    console.log("animateLikeDislike");
    const likeAnim: Animation = this.animationCtrl.create()
      .addElement(container.nativeElement)
      .duration(1000)
      .iterations(1)
      // .afterStyles({
      //   opacity: 0
      // })
      .keyframes([
        { offset: 0, transform: 'scale(1)' },
        { offset: 0.5, transform: 'scale(1.2)' },
        { offset: 1, transform: 'scale(1)' },
      ]);

    likeAnim.play();
  }

  animateUserCard(card: IonicMemberCardComponent) {
    console.log(card);
  }

  addLike(member: Member) {
    console.log("ion member list add like");
    this.memberService.addLike(member.username).subscribe({
      next: () => {
        
        // this.appRef.tick(); 
        // this.ref.markForCheck();
        this.toastr.success('You have liked ' + member.knownAs)
      },
      complete: () => {
        // this.appRef.tick(); 
        // this.ref.markForCheck();
      }
    });
    //console.log(this.appRef.components);
    //this.appRef.tick();
  }

  loadMatches() {
    if (this.userParams) {
      this.toggleLoading();
      console.log('before concert filter');
      console.log(this.userParams);
      //this.userParams.concertFilter = this.concertFilter;
      // if (this.distance) {
      //   this.userParams.distance = this.distance;
      // }
      console.log('afterconcert filter');
      console.log(this.userParams);
      //this.memberService.setUserParams(this.userParams);
      this.memberService.getMatches(this.userParams).subscribe({
        next: response => {
          if (response.result && response.pagination) {
          //   console.log("this.matches\n", this.matches);
          //   if (this.matches) {
          //     console.log("if this matches");
          //     this.matches = response.result; //[...response.result, ...this.remainingMatches];
          //   }
          //  else {
          //   console.log("else this matches");
          //   this.matches = response.result;
          //  }
           console.log("this.matches\n", this.matches);
           this.matches = response.result;
           this.matches.forEach((match: any) => {
            document.getElementById("likeCont-"+ match.id)?.addEventListener('click', () => { console.log("CLICK"); this.animateLikeDislike(this.likeCont) });
           })
           this.pagination = response.pagination;
           this.remainingCards = this.matches.length;
           console.log(this.remainingCards);
           this.remainingMatches = this.matches;
           
           
          }
        },
        complete: () => 
          {
            
          //   console.log("complete\n", this.matches);
          //   console.log(this.cardElRefs);
          //  console.log(this.cardElRefs.length);
           this.ref.detectChanges();
           this.ngAfterViewChecked();
           this.toggleLoading();
          // console.log(document.getElementById("cardCont")?.lastChild?.previousSibling?.childNodes);
           //console.log(document.querySelector("addLike"));
            // this.ngDoCheck();
          }
      })
    }
    
  }
  closeFilter() {
    this.panelOpenState = false;
  }
  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.selected = 'lastActive';
    this.loadMatches();
  }

  pageChanged(event: any) {
    if (this.userParams && this.userParams?.pageNumber !== event.pageIndex) {
      console.log(event);
      this.userParams.pageNumber = event.pageIndex;
      this.userParams.pageSize = event.pageSize;
      this.memberService.setUserParams(this.userParams);
      this.loadMembers();
    }
  }

  onScroll() {
    console.log("on scroll");
    console.log("userParams\n", this.userParams);
    console.log("pagination\n", this.pagination);
    if (this.userParams && this.pagination) {
      if (this.userParams?.pageNumber < this.pagination?.totalPages - 1) {
        console.log(this.userParams);
        this.userParams.pageNumber++;
        this.memberService.setUserParams(this.userParams);
        this.loadMatches();

      }
    }
    
    //this.appendData();
   }

  toggleSelected(value: string) {
    this.selected = this.selected != value ? value : this.selected;
    console.log(this.selected);
    if (this.userParams != null) {
      this.userParams.orderBy = this.selected;
    }
    //this.userParams.orderBy = this.userParams.orderBy != null ? this.selected : '';
  }

  onFilterBtnChange(event: any) {
    console.log(event.currentTarget.getAttribute('value'));
    if (this.userParams != null) {
      this.userParams.orderBy = event.source._value != null ? event.source._value[0] : '';
    }
    
  }

  openMatchDialog(member: Member): void {
    console.log(member);
    // if ($event.target) {
    //   console.log($event.target);
    //   // const eventTarget: HTMLElement = $event?.target as HTMLButtonElement;
    //   // if (eventTarget.parentElement?.id === "add-concert-button") {
    //   //   console.log("button with id string check");
    //   //   return;
    //   // }
    // }

    this.isMatchDialogVisible = true;

    // const dialogRef = this.matchDialog.open(MatchDialogComponent, {
    //   width: '60vw',
    //   height: 'auto',
    //   // scrollStrategy: this.scrollStrategy,
    //   panelClass: 'concert-dialog',
    //   data: member
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   // console.log(`Dialog result: ${result}`);
    //   // console.log(result);
    // });
  }

  closeMatchDialog() : void {
    this.isMatchDialogVisible = false;
  }



  ngOnDestroy(): void {
    console.log("destroy match list");
    if (this.userParams) {
      this.userParams.pageNumber = 0;
    }
    
  }
}
