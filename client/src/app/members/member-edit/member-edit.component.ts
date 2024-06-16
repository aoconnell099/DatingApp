import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PresenceService } from 'src/app/_services/presence.service';
import { Gallery, GalleryConfig, GalleryItem, ImageItem } from 'ng-gallery';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm?: NgForm;
  // member?: Member;
  member: Member = {} as Member;
  user: User | null = null;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  landscapeBreakpoint = '(max-height: 450px)'; //(max-width: 959.98px) and 
  isLandscape = false;
  galleryId = 'lightbox';
  galleryPhotos: GalleryItem[] = [];

  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)  Unnecessary
    distinctUntilChanged()
  );

  constructor(private accountService: AccountService, private route: ActivatedRoute, private memberService: MembersService, private breakpointObserver: BreakpointObserver,
            private toastr: ToastrService, public presence: PresenceService, public gallery: Gallery) { 
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        this.user = user;
      }
    });
  }

  ngOnInit(): void {
    // this.route.data.subscribe({
    //   next: data => {
    //     this.member = data['member'];
    //   }
    // });
    this.loadMember();
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged() 
    );

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

    const galleryRef = this.gallery.ref(this.galleryId);
    //this.galleryPhotos = this.getImages();
    galleryRef?.load(this.galleryPhotos);
    const config: GalleryConfig = {
      thumb: false,
    };
    galleryRef.setConfig(config);
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

  loadMember() {
    if (!this.user) return;
    this.memberService.getMember(this.user.username).subscribe({
      next: member => {
        console.log("member");
        console.log(member);
        this.member = member;
        this.galleryPhotos = this.getImages();
      }
    });
  }

  getImages(): GalleryItem[] {
    if (!this.member) return [];

    const imageUrls = [];
    console.log(this.member)
    for (const photo of this.member.photos) {
      imageUrls.push(new ImageItem({
        src: photo?.url,
        thumb: photo?.url,
      }))
    }

    return imageUrls;
  }

  updateMember() {
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next: _ => { // _ is used to denoted an unused param
        this.toastr.success('Profile updated successfully');
        this.editForm?.reset(this.member);
      }
    })
    // this.memberService.updateMember(this.member).subscribe(() => { // No return value so params are left empty
    //   this.toastr.success("Profile updated successfully.");
    //   this.editForm.reset(this.member);
    // });
    
  }
}
