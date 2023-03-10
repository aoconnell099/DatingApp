import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Concert } from "../_models/concert"
import { HttpClient } from '@angular/common/http';
import { ConcertParams } from '../_models/concertParams';
import { TicketMasterParams } from '../_models/ticketMasterParams';

@Injectable({
  providedIn: 'root'
}) 
export class ConcertService {
  baseUrl = environment.apiUrl;
  concerts: Concert[] = [];
  concertParams: ConcertParams;
  ticketMasterParams: TicketMasterParams;
  
  constructor(private http: HttpClient) { 
    this.concertParams = new ConcertParams();
    this.ticketMasterParams = new TicketMasterParams();

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

  getTicketMasterParams() {
    return this.ticketMasterParams;
  }

  setTicketMasterParams(params: TicketMasterParams) {
    this.ticketMasterParams = params;
  }

  resetTicketMasterParams() {
    this.ticketMasterParams = new TicketMasterParams();
    return this.ticketMasterParams;
  }

  getConcertsForUser(concertParams: ConcertParams) {
    let params = getPaginationHeaders(concertParams.pageNumber, concertParams.pageSize);
    return getPaginatedResult<Concert[]>(this.baseUrl + 'concerts', params, this.http);
  }

  getUserEventIds() {
    return this.http.get<string[]>(this.baseUrl + 'concerts/user-events');
  }

  searchConcerts(ticketMasterParams: TicketMasterParams) {
    console.log(ticketMasterParams);
    var paramString = 'keyword=' + ticketMasterParams.keyword + '&classificationName=' + ticketMasterParams.classificationName;
    return this.http.get<Concert[]>(this.baseUrl + 'concerts/search?' + paramString);
  }

  addConcert(concert: Concert) {
    //console.log("concert service"  + concert);
    return this.http.post(this.baseUrl + 'concerts/add-concert', concert);
  }

  removeUserConcert(concert: Concert) {
    //console.log("concert service - "+concert);
    return this.http.delete(this.baseUrl + 'concerts/delete-user-concert/' + concert.eventId);
  }
}
