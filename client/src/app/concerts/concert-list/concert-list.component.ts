import { Component, Input, OnInit } from '@angular/core';
import { Concert } from '../../_models/concert';
import { Member } from '../../_models/member';
import { Pagination } from '../../_models/paginations';
import { ConcertService } from '../../_services/concert.service';

@Component({
  selector: 'app-concert-list',
  templateUrl: './concert-list.component.html',
  styleUrls: ['./concert-list.component.css']
})
export class ConcertListComponent implements OnInit {
  concerts: Concert[];
  pagination: Pagination;
  pageNumber = 1;
  pageSize = 5;

  constructor(private concertService: ConcertService) { }

  ngOnInit(): void {
    this.loadUserConcerts();
  }

  loadUserConcerts() {
    this.concertService.getConcertsForUser(this.pageNumber, this.pageSize).subscribe(response => {
      this.concerts = response.result;
      console.log(this.concerts);
      this.pagination = response.pagination;
    })
  }

  pageChanged(event: any) {
    this.pageNumber = event.page;
    this.loadUserConcerts();
  }

}
