import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Concert } from "../_models/concert"
import { HttpClient } from '@angular/common/http';
import { ConcertParams } from '../_models/concertParams';

@Injectable({
  providedIn: 'root'
})
export class ConcertService {
  baseUrl = environment.apiUrl;
  concerts: Concert[] = [];
  concertParams: ConcertParams;
  
  constructor(private http: HttpClient) { 
    this.concertParams = new ConcertParams();
  }

  getConcertParams() {
    return this.concertParams;
  }

  setConcertParams(params: ConcertParams) {
    this.concertParams = params;
  }

  resetConcertParams() {
    this.concertParams = new ConcertParams();
    return this.concertParams;
  }

  getConcertsForUser(concertParams: ConcertParams) {
    let params = getPaginationHeaders(concertParams.pageNumber, concertParams.pageSize);
    return getPaginatedResult<Concert[]>(this.baseUrl + 'concerts', params, this.http);
  }
}
