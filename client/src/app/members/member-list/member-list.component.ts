import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/paginations';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
//import { MatGridList } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MemberListComponent implements OnInit {
  members: Member[] =[];
  pagination?: Pagination;
  userParams?: UserParams;
  //user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  
  numberOfCols?: number;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  mobileBreakpoint = '';
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 400px)'
  rowHeightRatio = "1:1.5";

  selected = 'lastActive';

  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)
    distinctUntilChanged()
  );

  constructor(private memberService: MembersService, private breakpointObserver: BreakpointObserver) { 
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
    this.loadMembers();
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
    
    // if(this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait)) {
    //   this.currentBreakpoint = Breakpoints.HandsetPortrait;
    //   console.log('portrait');
    // } else if(this.breakpointObserver.isMatched(Breakpoints.HandsetLandscape)) {
    //   this.currentBreakpoint = Breakpoints.HandsetLandscape;
    //   console.log('landscape');
    // } 

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
      this.memberService.setUserParams(this.userParams);
      this.memberService.getMembers(this.userParams).subscribe({
        next: response => {
          if (response.result && response.pagination) {
            this.members = response.result;
            this.pagination = response.pagination;
          }
        }
      })
    }
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event: any) {
    if (this.userParams && this.userParams?.pageNumber !== event.page) {
      this.userParams.pageNumber = event.page;
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
