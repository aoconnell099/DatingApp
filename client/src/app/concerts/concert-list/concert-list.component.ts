import { Component, OnInit } from '@angular/core';
import { Concert } from 'src/app/_models/concert';
import { ConcertParams } from 'src/app/_models/concertParams';
import { Pagination } from 'src/app/_models/paginations';
import { UserParams } from 'src/app/_models/userParams';
import { ConcertService } from 'src/app/_services/concert.service';

@Component({
  selector: 'app-concert-list',
  templateUrl: './concert-list.component.html',
  styleUrls: ['./concert-list.component.scss']
})
export class ConcertListComponent implements OnInit {
  concerts: Concert[] = [];
  pagination?: Pagination;
  concertParams?: ConcertParams;

  constructor(private concertService: ConcertService) {
    this.concertParams = this.concertService.getConcertParams();
   }

  ngOnInit(): void {
    this.loadConcerts();
  }

  loadConcerts() {
    if (this.concertParams) {
      this.concertService.getConcertsForUser(this.concertParams).subscribe({
        next: response => {
          if (response.result && response.pagination) { 
            this.concerts = response.result;
            this.pagination = response.pagination;
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

}
