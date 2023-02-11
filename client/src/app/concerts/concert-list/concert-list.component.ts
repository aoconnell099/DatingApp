import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, tap } from 'rxjs';
import { Concert } from 'src/app/_models/concert';
import { ConcertParams } from 'src/app/_models/concertParams';
import { Pagination } from 'src/app/_models/paginations';
import { TicketMasterParams } from 'src/app/_models/ticketMasterParams';
import { UserParams } from 'src/app/_models/userParams';
import { ConcertService } from 'src/app/_services/concert.service';

@Component({
  selector: 'app-concert-list',
  templateUrl: './concert-list.component.html',
  styleUrls: ['./concert-list.component.scss']
})
export class ConcertListComponent implements OnInit, OnDestroy {
  
  concerts: Concert[] = [];
  searchResult: Concert[] = [];
  concertToAdd?: Concert;
  pagination?: Pagination;
  concertParams?: ConcertParams;
  ticketMasterParams?: TicketMasterParams;

  // search = "";

  numberOfCols?: number;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  mobileBreakpoint = '';
  landscapeBreakpoint = '(max-width: 959.98px) and (max-height: 400px)';
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  rowHeightRatio = "1:1.5";

  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, this.landscapeBreakpoint, this.smallerBreakpoint])
  .pipe(
    tap(), //value => console.log(value)
    distinctUntilChanged()
  );

  constructor(private concertService: ConcertService, private breakpointObserver: BreakpointObserver) {
    this.concertParams = this.concertService.getConcertParams();
    this.ticketMasterParams = this.concertService.getTicketMasterParams();
   }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
    this.loadConcerts();
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
    } else if(this.breakpointObserver.isMatched(this.smallerBreakpoint)) {
        this.currentBreakpoint = this.smallerBreakpoint;
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
    
    // if(this.currentBreakpoint === Breakpoints.XLarge || this.currentBreakpoint === Breakpoints.Large) {
    //   this.numberOfCols = 3;
    //   this.rowHeightRatio = "1:1.3";
    // } else if(this.currentBreakpoint === Breakpoints.Medium) {
    //   this.numberOfCols = 2;
    //   this.rowHeightRatio = "1:1.2";
    // } else if(this.currentBreakpoint === Breakpoints.Small) {
    //   this.numberOfCols = 2;
    //   this.rowHeightRatio = "0.7:1.2";
    // } else if(this.currentBreakpoint === Breakpoints.XSmall) {
    //   this.numberOfCols = 1;
    //   this.rowHeightRatio = "1:1.3";
    // }
    if(this.currentBreakpoint === Breakpoints.XLarge) {
      this.numberOfCols = 2;
      this.rowHeightRatio = "1:1.3";
    } else if(this.currentBreakpoint === Breakpoints.Large || this.currentBreakpoint === Breakpoints.Medium) {
      this.numberOfCols = 1;
      this.rowHeightRatio = "1:1.4";
    } else if(this.currentBreakpoint === Breakpoints.Small) {
      this.numberOfCols = 1;
      this.rowHeightRatio = "1:1.7";
    } else if(this.currentBreakpoint === Breakpoints.XSmall) {
      this.numberOfCols = 1;
      this.rowHeightRatio = "1:2.1";
    }
  }

  loadConcerts() {
    if (this.concertParams) {
      this.concertService.getConcertsForUser(this.concertParams).subscribe({
        next: response => {
          if (response.result && response.pagination) { 
            this.concerts = response.result;
            this.pagination = response.pagination;
            console.log(this.concerts);
          }  
        }
      })
    } 
    
  }

  resetFilters() {
    this.concertParams = this.concertService.resetConcertParams();
    this.loadConcerts();
  }

  pageChanged(event: any) {
    if (this.concertParams && this.concertParams?.pageNumber !== event.page) {
      this.concertParams.pageNumber = event.page;
      this.concertService.setConcertParams(this.concertParams);
      this.loadConcerts();
    }
  }

  
  ngOnDestroy(): void {
    console.log("destroy concert list");
  }

}
