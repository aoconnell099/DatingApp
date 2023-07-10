import { AfterViewInit, Component, ContentChildren, ElementRef, HostListener, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
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

@Component({
  selector: 'app-ionic-member-list',
  templateUrl: './ionic-member-list.component.html',
  styleUrls: ['./ionic-member-list.component.scss'],
})
export class IonicMemberListComponent implements OnInit, AfterViewInit {
  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number; }; }) {
    this.windowWidth = event.target.innerWidth;
    // this.windowWidth = window.innerWidth;
    console.log(this.windowWidth);
  }
  @ViewChild('cardCont') cardCont!: ElementRef<any>;
  @ViewChild('dislikeCont') dislikeCont!: ElementRef<any>;
  @ViewChild('likeCont') likeCont!: ElementRef<any>;
  @ViewChildren(IonicMemberCardComponent, { read: ElementRef }) cardElRefs!: QueryList<ElementRef>
  @ViewChildren(IonicMemberCardComponent) cardCompRefs!: QueryList<IonicMemberListComponent>
  
  members: Member[] = [];
  matches: any = [];
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
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 400px)'
  rowHeightRatio = "1:1.5";

  selected = 'lastActive';

  windowWidth = window.innerWidth;

  concertFilter = false;
  distance?: number;

  userLoc?: any;
  


  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)
    distinctUntilChanged()
  );

  constructor(private memberService: MembersService, private breakpointObserver: BreakpointObserver,
      private gestureCtrl: GestureController, private animationCtrl: AnimationController,
      private toastr: ToastrService) { 
    this.userParams = this.memberService.getUserParams();
    
  }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged() 
    );
    
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

  ngAfterViewInit(): void {
    console.log("afterViewInit");
    this.cardElRefs.forEach((memberCard: any) => {
      console.log(memberCard);
    })
  }

  ngAfterViewChecked(): void {
    this.cardElRefs.forEach((memberCard: any, index: number) => {
      memberCard.nativeElement.addEventListener("transitionend", () => {
        
      });      
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
            memberCard.nativeElement.style.transform = `translateX(${this.windowWidth * 1.5}px)`;
            this.animateLikeDislike(this.likeCont);
            this.likeCont.nativeElement.style.opacity = 0; // This runs before the animation completes but looks good so leave for now.
            
            if (this.selectedMember) {
              this.addLike(this.selectedMember);
            }
            memberCard.nativeElement.ontransitionend = () => {
              console.log("transitionEnd");
              memberCard.nativeElement.remove();
            } 
            //memberCard.nativeElement.remove();
          } else if (detail.deltaX < -this.windowWidth / 2.5) {
            memberCard.nativeElement.style.transform = `translateX(-${this.windowWidth * 1.5}px)`
            this.animateLikeDislike(this.dislikeCont);
            //this.dislikeCont.nativeElement.style.transform = 'scale(1.2)';
            this.dislikeCont.nativeElement.style.opacity = 0;
            //emit event or like the user
            memberCard.nativeElement.ontransitionend = () => {
              console.log("transitionEnd");
              memberCard.nativeElement.remove();
            } 
          } else {
            memberCard.nativeElement.style.transform = '';
            this.likeCont.nativeElement.style.opacity = 0;
            this.dislikeCont.nativeElement.style.opacity = 0;
          }
          console.log(this.selectedMember);
          // this.likeCont.nativeElement.style.transform = 'scale(1)';
          // this.dislikeCont.nativeElement.style.transform = 'scale(1)';
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

  loadMembers() {
    if (this.userParams) {
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
        }
      }) 
    }
  }

  selectMember(member: Member) {
    console.log(member);
    this.selectedMember = member;
  }

  animateLikeDislike(container: ElementRef<any>) {
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

  addLike(member: Member) {
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toastr.success('You have liked ' + member.knownAs)
    })
  }

  loadMatches() {
    if (this.userParams) {
      console.log('before concert filter');
      console.log(this.userParams);
      //this.userParams.concertFilter = this.concertFilter;
      // if (this.distance) {
      //   this.userParams.distance = this.distance;
      // }
      console.log('afterconcert filter');
      console.log(this.userParams);
      this.memberService.setUserParams(this.userParams);
      this.memberService.getMatches(this.userParams).subscribe({
        next: response => {
          if (response.result && response.pagination) {
           this.matches = response.result;
           this.pagination = response.pagination;
          }
        }
      })
    }
    
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.selected = 'lastActive';
    this.loadMembers();
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
}
