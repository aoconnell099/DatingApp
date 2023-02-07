import { Component, OnInit } from '@angular/core';
import { Concert } from 'src/app/_models/concert';
import { ConcertParams } from 'src/app/_models/concertParams';
import { TicketMasterParams } from 'src/app/_models/ticketMasterParams';
import { ConcertService } from 'src/app/_services/concert.service';
import { Pagination } from 'src/app/_models/paginations';
import { MatDialog } from '@angular/material/dialog';
import { ConcertDialogComponent } from '../../modals/concert-dialog/concert-dialog.component';
import { BlockScrollStrategy, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-concert-search',
  templateUrl: './concert-search.component.html',
  styleUrls: ['./concert-search.component.scss']
})
export class ConcertSearchComponent implements OnInit {
  search = "";
  searchResult: Concert[] = [];
  concerts: Concert[] = [];
  concertToAdd?: Concert;
  pagination?: Pagination;
  concertParams?: ConcertParams;
  ticketMasterParams?: TicketMasterParams;

  hover: boolean = false;

  scrollStrategy: ScrollStrategy | undefined;

  constructor(private concertService: ConcertService, public concertCard: MatDialog,
        private readonly scrollStrategyOptions: ScrollStrategyOptions) { 
    this.concertParams = this.concertService.getConcertParams();
    this.ticketMasterParams = this.concertService.getTicketMasterParams();
  }

  ngOnInit(): void {
    this.scrollStrategy = this.scrollStrategyOptions.block();
    console.log(this.scrollStrategy);
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
          console.log(response);
          if (response) {
            this.searchResult = response;
            console.log(response);
            // this.searchResult.forEach((concert) => {
            //   var newDate = formatDate(concert.eventDate, 'medium');
            //   concert.eventDate.
            // })
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
          console.log(response);
          if (response) {
            this.loadConcerts();

          }
        }
      })
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

  openConcertCard(concert: Concert): void {
    const dialogRef = this.concertCard.open(ConcertDialogComponent, {
      width: '60vw',
      height: 'auto',
      // scrollStrategy: this.scrollStrategy,
      panelClass: 'concert-dialog',
      data: concert
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      // console.log(result);
    });
  }

}
