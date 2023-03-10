import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { Pagination } from '../_models/paginations';
import { MembersService } from '../_services/members.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { distinctUntilChanged, tap } from 'rxjs';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {
  members?: Member[]; // Partial makes each property in member optional
  predicate = 'liked';
  pageNumber = 0;
  pageSize = 5;
  pagination?: Pagination;

  numberOfCols?: number;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  mobileBreakpoint = '';
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 400px)'
  rowHeightRatio = "1:1.5";

  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint])
  .pipe(
    tap(), //value => console.log(value)
    distinctUntilChanged()
  );

  constructor(private memberService: MembersService, private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
    this.loadLikes();
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
  
  loadLikes() {
    this.memberService.getLikes(this.predicate, this.pageNumber, this.pageSize).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.members = response.result;
          this.pagination = response.pagination;
        }
      }
    })
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadLikes();
    }
  }

}
