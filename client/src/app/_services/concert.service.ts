import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Concert } from "../_models/concert"
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConcertService {
  baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  getConcertsForUser(pageNumber, pageSize) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResult<Concert[]>(this.baseUrl + 'concerts', params, this.http);
  }
}
