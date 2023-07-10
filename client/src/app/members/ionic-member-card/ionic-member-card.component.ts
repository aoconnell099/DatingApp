import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { PresenceService } from 'src/app/_services/presence.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Gesture, GestureController, GestureDetail } from '@ionic/angular';
import { MemberCardComponent } from '../member-card/member-card.component';
@Component({
  selector: 'app-ionic-member-card',
  templateUrl: './ionic-member-card.component.html',
  styleUrls: ['./ionic-member-card.component.scss']
})
export class IonicMemberCardComponent implements OnInit {
  @Input() member?: Member;
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  @ViewChild('tracker') p?: ElementRef;
  //@ViewChildren('memberCard') memberCard?: IonicMemberCardComponent;

  
  constructor(private memberService: MembersService, private toastr: ToastrService, 
      public presenceService: PresenceService, private gestureCtrl: GestureController) { }

  ngOnInit(): void {
    // console.log("on init ");
    // console.log(this.member);
    // console.log(document.querySelectorAll('app-ionic-member-card')!);
    // console.log(this.memberCard);
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

  ngOnChanges(): void {
    // console.log("on changes ");
    // console.log(this.member);
    // console.log(document.querySelector('app-ionic-member-card')!);
    // console.log(this);
    // console.log(this.memberCard);
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

  addLike(member: Member) {
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toastr.success('You have liked ' + member.knownAs)
    })
  }

}
