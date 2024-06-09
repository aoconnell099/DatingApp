import { Component, OnInit, ViewChild } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/paginations';
import { ConfirmService } from '../_services/confirm.service';
import { MessageService } from '../_services/message.service';
import { MembersService } from '../_services/members.service';
import { Member } from '../_models/member';
import { Conversation } from '../_models/conversation';
import { PresenceService } from '../_services/presence.service';
import { AccountService } from '../_services/account.service';
import { take } from 'rxjs';
import { User } from '../_models/user';
import { NgForm } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  animations: [
	  trigger('showHide', [
		state(
			'visible',
			style({
				transform: 'scale(1)',
				opacity: 1,
			})
		),
		state(
			'void, hidden',
			style({
				transform: 'scale(0.5)',
			})
		),
		transition('* => visible', animate('150ms')),
		transition('* => void, * => hidden', animate('150ms'))
	  ]),
	],
})
export class MessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm?: NgForm;
  messageContent = '';
  messages?: Message[]; // Previously = []..changed for delete messages
  pagination?: Pagination;
  container = 'Unread';
  pageNumber = 0;
  pageSize = 15;
  loading = false;
  conversations?: Conversation[];
  matches?: Member[];
  selectedUser?: string;
  user?: User;
  

  constructor(public messageService: MessageService, private confirmService: ConfirmService, 
    private memberService: MembersService, public presence: PresenceService, private accountService: AccountService) { 
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next: user => {
          if (user) this.user = user;
        }
      });
    }

  ngOnInit(): void {
    this.loadMatches();
    //this.loadMessages();
    this.loadConversations();
  }

  loadMessages() {
    this.loading = true;
    console.log(this.container);
    const tablinks =  Array.from(document.getElementsByClassName("tab-links") as HTMLCollectionOf<HTMLElement>);
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" tab-button", "");
    }
    if (this.container == "Unread") {
      const tab = document.getElementById("unread");
      if (tab) {
        tab.className += " tab-button";
      }
    }
    else if (this.container == "Inbox") {
      const tab = document.getElementById("inbox");
      if (tab) {
        tab.className += " tab-button";
      }
    }
    else if (this.container == "Outbox") {
      const tab = document.getElementById("outbox");
      if (tab) {
        tab.className += " tab-button";
      }
    }
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe({
      next: response => {
        console.log(response);
        if (response.result && response.pagination) {
          this.messages = response.result;
          this.pagination = response.pagination;
          this.loading = false;
          console.log("messages\n", this.messages);
        }
      }
    });
  }

  loadConversations() {
    this.messageService.getConversations(this.pageNumber, this.pageSize).subscribe({
      next: response => {
        console.log(response);
        if (response.result) {
          console.log("response");
          this.conversations = response.result;
          //this.pagination = response.pagination;
        }
      }
    })
  }

  loadMatches() {
    this.memberService.getLikes("matches", this.pageNumber, this.pageSize).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          if (this.matches) {
            this.matches = [...this.matches!, ...response.result];
          }
          else {
            this.matches = response.result;
          }
          
          this.pagination = response.pagination;
          console.log(this.matches);
          this.matches = this.matches.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
          console.log(this.matches);

        }
      },
      //complete: () => this.toggleLoading()
    })
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => this.messages?.splice(this.messages.findIndex(m => m.id === id), 1)
    });

    // this.confirmService.confirm('Confirm delete message', 'This cannot be undone').subscribe(result => {
    //   if (result) {
    //     this.messageService.deleteMessage(id).subscribe(() => {
    //       this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
    //     })
    //   }
    // })
    
  }

  selectConversation(event: any, conversation: Conversation) {
    console.log(event);
    if (this.selectedUser == null) {
      this.selectedUser = conversation.otherUser;
      this.messageService.createHubConnection(this.user!, conversation.otherUser);
    }
    else {
      this.messageService.stopHubConnection();
      this.selectedUser = conversation.otherUser;
      this.messageService.createHubConnection(this.user!, conversation.otherUser);
    }
  }
  
  selectMatch(event: any, match: Member) {
    console.log(event);
    if (this.selectedUser == null) {
      this.selectedUser = match.username;
      this.messageService.createHubConnection(this.user!, match.username);
    }
    else {
      this.messageService.stopHubConnection();
      this.selectedUser = match.username;
      this.messageService.createHubConnection(this.user!, match.username);
    }
  }

  sendMessage() {
    if (!this.selectedUser) return;
    //this.loading = true;
    this.messageService.sendMessage(this.selectedUser, this.messageContent).then(() => {
      this.messageForm?.reset();
    }).finally();//() => this.loading = false
  }

  pageChanged(event: any) {
    if (this.pageNumber != event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
    
  }

}
