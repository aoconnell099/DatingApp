import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, pipe } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/paginations';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token
//   })
// };

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user?: User;
  userParams?: UserParams;
  
  constructor(private http: HttpClient, private accountService: AccountService) { // Make sure not to inject the MembersService into the AccountService to avoid circular referencing
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.user = user;
          this.userParams = new UserParams(user);
        }
      }
    })
   }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams : UserParams) {
    console.log(userParams);
    const response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge.toString()); //remove tostring
    params = params.append('maxAge', userParams.maxAge.toString()); //remove tostring
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
      .pipe(map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      }))
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()] // Returns an array of PaginatedResult arrays containing the results returned after each filter
      .reduce((arr, elem) => arr.concat(elem.result), []) // Create an empty array and fill it with the concatenated result after joing the values contained in each PaginatedResult array 
      .find((member: Member) => member.username === username); // Return the first instance where the username is equal to the member you are trying to find
                                                                // Allows you to retrieve the member from the cache instead of making an api call every time. The member should already
                                                                // be in the cache from loading and saving the paginated results in getMembers()
      if (member) {
        return of(member);
      }
    // If you don't have a member, then make an api call
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        //this.members[index] = member;
        this.members[index] = { ...this.members[index], ...member };
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    //return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.http);
  }

  getMatches(userParams: UserParams) {
    console.log('members service userparams');
    console.log(userParams);
    const response = this.memberCache.get(Object.values(userParams).join('-'));
    console.log(response);
    if (response) {
      return of(response);
    }

    // let concertFilter = "false";
    // if (userParams.concertFilter == true) {
    //   concertFilter = "true";
    // }
    // else if (userParams.concertFilter == false) {
    //   concertFilter = "false";
    // }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    
    params = params.append('minAge', userParams.minAge.toString()); //remove tostring
    params = params.append('maxAge', userParams.maxAge.toString()); //remove tostring
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    if (userParams.concertFilter != undefined) {
      params = params.append('concertFilter', userParams.concertFilter);
    }
    params = params.append('distance', userParams.distance);
    params = params.append('latitude', userParams.latitude);
    params = params.append('longitude', userParams.longitude);

    console.log('members service params');
    console.log(params);
    return getPaginatedResult<Member[]>(this.baseUrl + 'users/matches', params, this.http)
      .pipe(map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        console.log(response);
        return response;
      }));

    // let matches = this.http.get(this.baseUrl + 'users/matches');
    // console.log(matches);
    // return matches;
    // return this.http.get(this.baseUrl + 'users/matches');
  }

}
