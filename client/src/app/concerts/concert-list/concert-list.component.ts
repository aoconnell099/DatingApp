import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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
  //@ViewChild('paginator') paginator!: MatPaginator;
  @Output() load: EventEmitter<any> = new EventEmitter();
  @Input() concerts: Concert[] = [];
  @Input() pagination?: Pagination;
  searchResult: Concert[] = [];
  concertToAdd?: Concert;
  concertParams?: ConcertParams;
  ticketMasterParams?: TicketMasterParams;
  dataSource?: MatTableDataSource<any>;

  isLoading=false;

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
    
    //this.loadConcerts();
  }

  ngViewAfterInit() {
    // this.dataSource = new MatTableDataSource<any>(this.concerts);
    // this.dataSource.paginator = this.paginator;
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
    
    if(this.currentBreakpoint === Breakpoints.XLarge || this.currentBreakpoint === Breakpoints.Large) {
      this.numberOfCols = 3;
      this.rowHeightRatio = "1:1.3";
    } else if(this.currentBreakpoint === Breakpoints.Medium) {
      this.numberOfCols = 2;
      this.rowHeightRatio = "1:1.2";
    } else if(this.currentBreakpoint === Breakpoints.Small) {
      this.numberOfCols = 2;
      this.rowHeightRatio = "0.7:1.2";
    } else if(this.currentBreakpoint === Breakpoints.XSmall) {
      this.numberOfCols = 1;
      this.rowHeightRatio = "1:1.5";
    }

    // For single page list and search
    // if(this.currentBreakpoint === Breakpoints.XLarge) {
    //   this.numberOfCols = 2;
    //   this.rowHeightRatio = "1:1.3";
    // } else if(this.currentBreakpoint === Breakpoints.Large || this.currentBreakpoint === Breakpoints.Medium) {
    //   this.numberOfCols = 1;
    //   this.rowHeightRatio = "1:1.4";
    // } else if(this.currentBreakpoint === Breakpoints.Small) {
    //   this.numberOfCols = 1;
    //   this.rowHeightRatio = "1:1.7";
    // } else if(this.currentBreakpoint === Breakpoints.XSmall) {
    //   this.numberOfCols = 1;
    //   this.rowHeightRatio = "1:2.1";
    // }
  }
  toggleLoading = ()=>this.isLoading=!this.isLoading;

  loadConcerts() {
    if (this.concertParams) {
      this.toggleLoading();
      this.concertService.getConcertsForUser(this.concertParams).subscribe({
        next: response => {
          if (response.result && response.pagination) { 
            this.concerts = response.result; //[...this.concerts, ...response.result];
            this.pagination = response.pagination;
            console.log(this.concerts);
          }  
        },
        //complete: () => this.toggleLoading()
      })
    } 
    
  }

  removeConcert(event: Concert) {
    console.log(event);
      this.concertService.removeUserConcert(event).subscribe({
        next: response => {
          console.log(response);
          if (this.concerts) {
            console.log(this.concerts);
            this.concerts = this.concerts.filter(x => x.id !== event.id); // Returns an array of all of the concerts whose concert id are not equal to the id passed in
            console.log(this.concerts);
            this.load.emit(true);
          } 
        }
      })  
  }

  resetFilters() {
    this.concertParams = this.concertService.resetConcertParams();
    this.loadConcerts();
  }

  pageChanged(event: any) {
    console.log("page changed");
    console.log(event);
    if (this.concertParams && this.concertParams?.pageNumber !== event.pageIndex) {
      console.log(this.concertParams);
      this.concertParams.pageNumber = event.pageIndex;
      this.concertParams.pageSize = event.pageSize;
      this.concertService.setConcertParams(this.concertParams);
      this.loadConcerts();
    }
  }

  onScroll= ()=>{
    if (this.concertParams) {
      this.concertParams.pageNumber++;
      this.concertService.setConcertParams(this.concertParams);
      this.loadConcerts();

    }
    
    //this.appendData();
   }
  
  ngOnDestroy(): void {
    console.log("destroy concert list");
  }

}
