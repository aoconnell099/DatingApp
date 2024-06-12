import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../_models/group';
import { Message } from '../_models/message';
import { User } from '../_models/user';
import { BusyService } from './busy.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Conversation } from '../_models/conversation';
import { Router } from '@angular/router';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient, private busyService: BusyService, private router: Router, private presenceService: PresenceService) { }

  createHubConnection(user: User, otherUsername: string) {
    this.busyService.busy();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection.start()
      .catch(error => console.log(error))
      .finally(() => this.busyService.idle());

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThreadSource.next(messages);
    })

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThreadSource.next([...messages, message]); // Creates a new array that populates the BehaviorSubject 
                                                              // so you don't mutate state of the messageThreadSource
        // if (this.router.url == '/messages') {
          
          this.presenceService.newMessage.emit({message: message});
        // }
      })
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      console.log("UpdatedGroup");
      console.log("Group usernames \n");
      group.connections.forEach(e => {
        console.log(e.username + "\n");
      });
      console.log("otherusername: " + otherUsername)
      if (group.connections.some(x => x.username === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
            var isDateRead = (message.dateRead == null) ? false : true;
            console.log(isDateRead);
            if (!message.dateRead) {
              message.dateRead = new Date(Date.now());
              console.log(message.dateRead);
            }
          })
          this.messageThreadSource.next([...messages]);
        })
      }
    })
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.messageThreadSource.next([]); // Clears messages out when the user moves away from the member messages component
                                         // Stops old messages from being shown in a new message thread before loading current message thread
      this.hubConnection.stop();
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }
  
  getConversations(pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    // params = params.append('Container', container);
    return getPaginatedResult<Conversation[]>(this.baseUrl + 'messages/conversations', params, this.http);
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string) {
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content})
      .catch(error => console.log(error));                                                            /* When creating an object in this way, the name of the property 
                                                                                                         must match the property of the object(in this case Message).
                                                                                                         This is done by specifying the Message object property with the 
                                                                                                         parameter you're passing in. 
                                                                                                         Eg. recipientUsername(Message object property): username(parameter)
                                                                                                       */

  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
