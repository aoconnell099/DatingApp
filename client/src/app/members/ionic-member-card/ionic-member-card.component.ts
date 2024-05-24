import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChange, ViewChild, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { PresenceService } from 'src/app/_services/presence.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Gesture, GestureController, GestureDetail } from '@ionic/angular';
import { MemberCardComponent } from '../member-card/member-card.component';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-ionic-member-card',
  templateUrl: './ionic-member-card.component.html',
  styleUrls: ['./ionic-member-card.component.scss']
})
export class IonicMemberCardComponent implements OnInit, OnDestroy {
  @Input() member?: Member;
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  @ViewChild('tracker') p?: ElementRef;
  @Output() like: EventEmitter<Member> = new EventEmitter();
  @Input() shouldLike?: boolean;
  private eventsSubscription?: Subscription;

  

  @Input() events?: Observable<void>;

  //@ViewChildren('memberCard') memberCard?: IonicMemberCardComponent;

  
  constructor(private memberService: MembersService, private toastr: ToastrService, 
      public presenceService: PresenceService, private gestureCtrl: GestureController,
      ) { }

  ngOnInit(): void {
    //this.eventsSubscription = this.events!.subscribe(() => this.addLike(this.member!));
    // console.log("on init ");
    // console.log(this.member);
    // console.log(document.querySelectorAll('app-ionic-member-card')!);
    // console.log(this.memberCard);
  }
  ngOnDestroy() {
    //this.eventsSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    // console.log("on view init");
    // console.log(this.member);
    // let memberList = document.querySelectorAll('app-ionic-member-card')!;
    // memberList.forEach(memberCard => {
    //   console.log(memberCard);
    //   let gesture = this.gestureCtrl.create({
    //     el: memberCard,
    //     threshold: 0,
    //     gestureName: 'my-gesture',
    //     onMove: (detail) => { this.onMove(detail); }
    //   });
    //   gesture.enable();
    // });
    // console.log(memberList);
    // console.log(document.querySelector('app-ionic-member-card')!);
    // console.log(this.memberCard);
  }
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    // Extract changes to the input property by its name
    let change: SimpleChange = changes['shouldLike']; 

    console.log("onChanges");
    console.log(change);
    // Whenever the data in the parent changes, this method gets triggered
    // You can act on the changes here. You will have both the previous
    // value and the  current value here.
    // if (this.shouldLike) {
    //   this.addLike(this.member!);
    //   this.shouldLike = false;
    // }
    
}
  

  private onMove(detail: GestureDetail) {
    const type = detail.type;
    const currentX = detail.currentX;
    const deltaX = detail.deltaX;
    const velocityX = detail.velocityX;
  
    this.p!.nativeElement.innerHTML = `
      <div>Type: ${type}</div>
      <div>Current X: ${currentX}</div>
      <div>Delta X: ${deltaX}</div>
      <div>Velocity X: ${velocityX}</div>
    `
console.log("gesture for " + this.member?.knownAs);
console.log(detail);console.log(this.p);
  }

  // addLike(member: Member) {
  //   if (this.member) {
  //     console.log(member);
  //     this.like.emit(member);
  //   }
  // }
  addLike(member: Member) {
    console.log("add like");
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toastr.success('You have liked ' + member.knownAs)
    })
  }

}
