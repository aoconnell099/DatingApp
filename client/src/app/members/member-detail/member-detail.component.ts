import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import { GalleryComponent } from 'ng-gallery/public-api';
import { GalleryComponent, GalleryItem, ImageItem } from 'ng-gallery';
//import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
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
  styleUrls: ['./member-detail.component.scss']
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

  constructor(public presence: PresenceService, private route: ActivatedRoute, 
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

    this.route.queryParams.subscribe({
      next: params => {
        //params['tab'] ? this.selectTab(params['tab']) : this.selectTab(0);
        params['tab'] && this.selectTab(params['tab'])
      }
    });

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

    this.galleryImages = this.getImages();
    this.gallery?.load(this.galleryImages);
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
    })
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }


}
