import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { Conversation } from '../_models/conversation';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  @Output() newMessage = new EventEmitter<{conversation?: Conversation, message?: Message}>();
 
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', username => {
      console.log("online");
      console.log({username}+ " is online", username);
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next([...usernames, username])
        }
      })
    })

    this.hubConnection.on('UserIsOffline', username => {
      // this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
      //   this.onlineUsersSource.next([...usernames.filter(x => x !== username)])
      // })
      console.log("offline");
      console.log({username}+ " is offline", username);

      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next(usernames.filter(x => x !== username))
        }
      })
    })

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    })

    this.hubConnection.on('NewMessageReceived', ({username, knownAs, content, photoUrl, messageSent}) => {
      console.log("NewMessageReceived");

      this.toastr.info(knownAs + ' has sent you a new message!')
        .onTap
        .pipe(take(1)).subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=3'));

      if (this.router.url == '/messages') {
        const conversation: Conversation = {
          otherUser: username,
          otherUserPhotoUrl: photoUrl,
          isSender: false,
          content: content,
          messageSent: messageSent,
          dateRead: undefined
        }
        this.newMessage.emit({conversation: conversation});
      }
    })
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
