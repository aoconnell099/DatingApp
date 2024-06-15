import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import { GalleryComponent } from 'ng-gallery/public-api';
import { GalleryComponent, GalleryItem, ImageItem } from 'ng-gallery';
//import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
  // animations: [
	//   trigger('showHide', [
	// 	state(
	// 		'visible',
	// 		style({
	// 			transform: 'scale(1)',
	// 			opacity: 1,
	// 		})
	// 	),
	// 	state(
	// 		'void, hidden',
	// 		style({
	// 			transform: 'scale(0.5)',
	// 		})
	// 	),
	// 	transition('* => visible', animate('150ms')),
	// 	transition('* => void, * => hidden', animate('150ms'))
	//   ]),
	// ],
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  @ViewChild(GalleryComponent) gallery?: GalleryComponent;
  //@Input() member?: Member;
  member: Member = {} as Member;
  // galleryOptions: NgxGalleryOptions[] = [];
  // galleryImages: NgxGalleryImage[] = [];
  galleryImages: ImageItem[] = [];
  activeTab?: TabDirective;
  messages: Message[] = []; 
  user?: User;
  showGallery: boolean = true;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  landscapeBreakpoint = '(max-height: 450px)'; //(max-width: 959.98px) and 
  isLandscape = false;
  isLiked = false;

  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)  Unnecessary
    distinctUntilChanged()
  );

  constructor(public presence: PresenceService, private route: ActivatedRoute, private breakpointObserver: BreakpointObserver,
    private messageService: MessageService, private memberService: MembersService, 
    private accountService: AccountService, private router: Router, private toastr: ToastrService) { 
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next: user => {
          if (user) this.user = user;
        }
      });
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }
  
  ngOnInit(): void {
    this.route.data.subscribe({
      next: data => {
        this.member = data['member'];
      }
    });
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged() 
    );

    this.route.queryParams.subscribe({
      next: params => {
        //params['tab'] ? this.selectTab(params['tab']) : this.selectTab(0);
        params['tab'] && this.selectTab(params['tab'])
      }
    });

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
    let profOuter = document.getElementById('profOuter');
    let imageBio = document.getElementById('imageBio');
    let profInfo = document.getElementById('profInfo');

    // Then we set the value in the --vh custom property to the root of the document
    window.addEventListener('resize', () => {
      gradHeight = document.getElementById("gradient")?.clientHeight! * 0.01;
      currentScrollHeight = document.getElementById('profOuter')?.scrollTop;
      
      op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
      
      document.documentElement.style.setProperty('--gh', `${gradHeight}px`);
      document.documentElement.style.setProperty('--op', `${op}`);
      console.log(gradHeight);
      console.log(currentScrollHeight);
      console.log(op);
    });

    profOuter?.addEventListener('scroll', () => {
      console.log("prof outer scroll");
      gradHeight = document.getElementById("gradient")?.clientHeight! * 0.01;
      currentScrollHeight = document.getElementById('profOuter')?.scrollTop;
      
      op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
      
      document.documentElement.style.setProperty('--op', `${op}`);
    if (op < 0) {
        let gradEl = document.getElementById('gradient');
        let gradIconsEl = document.getElementById('gradient-icons');
        if (gradEl && gradIconsEl) {
          gradEl.style.zIndex = '-5';
          gradIconsEl.style.zIndex = '-5';
        }
      }
      else {
        let gradEl = document.getElementById('gradient');
        let gradIconsEl = document.getElementById('gradient-icons');
        if (gradEl && gradIconsEl) {
          gradEl.style.zIndex = '3'
          gradIconsEl.style.zIndex = '3'
        }
      }
    });

    profInfo?.addEventListener('scroll', () => {
      console.log("prof info scroll");
      gradHeight = document.getElementById("gradient")?.clientHeight! * 0.01;
      currentScrollHeight = document.getElementById('profInfo')?.scrollTop;
      
      op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
      
      
      document.documentElement.style.setProperty('--op', `${op}`);
      if (op < 0) {
        let gradEl = document.getElementById('gradient');
        let gradIconsEl = document.getElementById('gradient-icons');
        if (gradEl && gradIconsEl) {
          gradEl.style.zIndex = '-5';
          gradIconsEl.style.zIndex = '-5';
        }
      }
      else {
        let gradEl = document.getElementById('gradient');
        let gradIconsEl = document.getElementById('gradient-icons');
        if (gradEl && gradIconsEl) {
          gradEl.style.zIndex = '3'
          gradIconsEl.style.zIndex = '3'
        }
      }
    });

    // document.getElementById('profOuter')?.addEventListener('scroll', () => {
    //   console.log('scroll out');
    //   let currentScrollHeight = document.getElementById('profOuter')?.scrollTop;
    //   console.log(gradHeight);
    //   console.log(currentScrollHeight);
    //   let op = ((gradHeight * 100) - currentScrollHeight!) / (gradHeight * 100);
    //   console.log(op);
    //   document.documentElement.style.setProperty('--op', `${op}`);
    // });

    // this.galleryOptions = [
    //   {
    //     width: '500px',
    //     height: '500px',
    //     imagePercent: 100,
    //     thumbnailsColumns: 4,
    //     imageAnimation: NgxGalleryAnimation.Slide,
    //     preview: false 
    //   }
    // ]

    this.memberService.checkLiked(this.member.id).subscribe({
      next: response => {
        console.log(response);
        if (response === true) {
          this.isLiked = true;
        }
        else if (response === false) {
          this.isLiked = false;
        }
      }
    })

    this.galleryImages = this.getImages();
    this.gallery?.load(this.galleryImages);
    this.showGallery = this.galleryImages.length == 0 ? false: true;
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

    if(this.breakpointObserver.isMatched(this.landscapeBreakpoint)) {
      this.isLandscape = true;
    } 
    else {
      this.isLandscape = false;
    }
  }

  // getImages(): NgxGalleryImage[] {
  //   if (!this.member) return [];

  //   const imageUrls = [];
  //   for (const photo of this.member.photos) {
  //     imageUrls.push({
  //       small: photo?.url,
  //       medium: photo?.url,
  //       big: photo?.url
  //     })
  //   }

  //   return imageUrls;
  // }

    getImages(): ImageItem[] {
    if (!this.member) return [];

    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push(new ImageItem({
        src: photo?.url,
        thumb: photo?.url,
      }))
    }

    return imageUrls;
  }

  loadMessages() {
    if (this.member) {
      this.messageService.getMessageThread(this.member.username).subscribe({
        next: messages => {
          this.messages = messages;
        }
      })
    }
  }

  selectTab(heading: string) { // Param was tabId: number before using strict mode
    //this.memberTabs.tabs[tabId].active = true;
    // Select the tab clicked with the matching header name
    if (this.memberTabs) {
      console.log(this.memberTabs);
      this.memberTabs.tabs.find(x=> x.heading === heading)!.active = true;
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.user) { // Param was this.messages.length === 0 before using strict mode
      this.messageService.createHubConnection(this.user, this.member.username);
    }
    else {
      this.messageService.stopHubConnection();
    }
  }

  addLike(member: Member) {
    //console.log("like pressed");
    this.memberService.addLike(member.username).subscribe(() => {
      this.toastr.success('You have liked ' + member.knownAs);
      this.isLiked = true;
    })
  }
 
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }


}
