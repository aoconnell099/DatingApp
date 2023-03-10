import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Concert } from 'src/app/_models/concert';
import { ConcertParams } from 'src/app/_models/concertParams';
import { TicketMasterParams } from 'src/app/_models/ticketMasterParams';
import { ConcertService } from 'src/app/_services/concert.service';
import { Pagination } from 'src/app/_models/paginations';
import { MatDialog } from '@angular/material/dialog';
import { ConcertDialogComponent } from '../../modals/concert-dialog/concert-dialog.component';
import { BlockScrollStrategy, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-concert-search',
  templateUrl: './concert-search.component.html',
  styleUrls: ['./concert-search.component.scss']
})
export class ConcertSearchComponent implements OnInit {
  @Output() load: EventEmitter<any> = new EventEmitter();
  @Input() concerts?: Concert[];
  @Input() pagination?: Pagination;
  search = "";
  searchResult: Concert[] = [];
  initialSearchResult: Concert[] =[];
  //concerts: Concert[] = [];
  concertToAdd?: Concert;

  eventList: string[] = [];
  
  concertParams?: ConcertParams;
  ticketMasterParams?: TicketMasterParams;

  hover: boolean = false;

  scrollStrategy: ScrollStrategy | undefined;
  nativeElement: any;

  constructor(private concertService: ConcertService, private accountService: AccountService, public concertCard: MatDialog,
        private readonly scrollStrategyOptions: ScrollStrategyOptions) { 
    this.concertParams = this.concertService.getConcertParams();
    this.ticketMasterParams = this.concertService.getTicketMasterParams();
  }

  ngOnInit(): void {
    this.scrollStrategy = this.scrollStrategyOptions.block();
    console.log(this.scrollStrategy);
    console.log("search init");
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("search changes");
    console.log(changes);
    // this.concertService.getUserEventIds().subscribe({
    //   next: (response: string[]) => {
    //     if (response) {
    //       console.log(response);
    //       this.eventList = response;
    //       console.log(this.eventList);
    //     }
    //   }
    // })
    this.updateSearchResult();
  }



  searchConcerts() {
    console.log("search");
     if (this.ticketMasterParams) {
      console.log("search");
      this.ticketMasterParams.keyword = this.search;
      console.log(this.ticketMasterParams.keyword);
      console.log(this.search);
      this.concertService.searchConcerts(this.ticketMasterParams).subscribe({
        next: response => {
          console.log("inside of search concerts " + response);
          console.log(response.values);
          if (response) {
            console.log(this.concerts);
            //this.searchResult = response.filter(concert => !this.concerts?.includes(concert));
            this.initialSearchResult = response;
            this.searchResult = response.filter(concert => !this.eventList?.some(eventId => eventId === concert.eventId));
            this.updateSearchResult();
            console.log(this.searchResult);          
          }
        }
      })
    }
  }

  addConcert(concert: Concert) {
    console.log(concert);
    if (concert) {
      this.concertToAdd = concert;
      this.concertService.addConcert(this.concertToAdd).subscribe({
        next: (response: any) => {
          if (response) {
            console.log(response);
            console.log("concert added");
            console.log(this.concerts);
            this.load.emit(true);
            //console.log(this.concerts);
            this.searchResult = this.searchResult.filter(concert => concert.eventId !== response.eventId);
            // this.searchResult = this.searchResult.filter(concert => !this.concerts?.some(userConcert => userConcert.eventId === concert.eventId));
            //this.searchConcerts();
            //this.updateSearchResult();
            console.log(this.searchResult);
          }
        }
      })
    }
  }

  updateSearchResult() {
    console.log("update search result");
    this.concertService.getUserEventIds().subscribe({
      next: (response: string[]) => {
        if (response) {
          console.log(response);
          this.eventList = response;
          //this.searchResult = this.searchResult.filter(concert => !response.some(eventId => eventId === concert.eventId));
          this.searchResult = this.initialSearchResult.filter(concert => !this.eventList?.some(eventId => eventId === concert.eventId));
          console.log(this.searchResult);
        }
      }
    })

    //this.searchResult = this.searchResult.filter(concert => !this.concerts?.some(userConcert => userConcert.eventId === concert.eventId));
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

  openConcertCard($event: MouseEvent, concert: Concert): void {
    console.log($event);
    if ($event.target) {
      const eventTarget: HTMLElement = $event?.target as HTMLButtonElement;
      if (eventTarget.parentElement?.id === "add-concert-button") {
        console.log("button with id string check");
        return;
      }
    }

    const dialogRef = this.concertCard.open(ConcertDialogComponent, {
      width: '60vw',
      height: 'auto',
      // scrollStrategy: this.scrollStrategy,
      panelClass: 'concert-dialog',
      data: concert
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   // console.log(`Dialog result: ${result}`);
    //   // console.log(result);
    // });
  }

  ngOnDestroy(): void {
    console.log("concert search onDestroy")
  }
}
