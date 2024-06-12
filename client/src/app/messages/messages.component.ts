import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/paginations';
import { ConfirmService } from '../_services/confirm.service';
import { MessageService } from '../_services/message.service';
import { MembersService } from '../_services/members.service';
import { Member } from '../_models/member';
import { Conversation } from '../_models/conversation';
import { PresenceService } from '../_services/presence.service';
import { AccountService } from '../_services/account.service';
import { distinctUntilChanged, take, tap } from 'rxjs';
import { User } from '../_models/user';
import { NgForm } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
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
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messageForm') messageForm?: NgForm;
  messageContent = '';
  messages?: Message[] = []; // Previously = []..changed for delete messages
  pagination?: Pagination;
  container = 'Unread';
  pageNumber = 0;
  pageSize = 15;
  loading = false;
  conversations?: Conversation[] = [];
  matches?: Member[] = [];
  selectedUser?: string;
  user?: User;
  Breakpoints = Breakpoints;
  currentBreakpoint = '';
  
  readonly breakpoint$ = this.breakpointObserver
  .observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall, Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
  .pipe(
    tap(), //value => console.log(value)  Unnecessary
    distinctUntilChanged()
  );
  
  constructor(public messageService: MessageService, private confirmService: ConfirmService, private breakpointObserver: BreakpointObserver,
    private memberService: MembersService, public presence: PresenceService, private accountService: AccountService) { 
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next: user => {
          if (user) this.user = user;
        }
      });
      this.presence.newMessage.subscribe((newMess) => {
        console.log("update conversation");
        console.log(newMess);
        this.updateConversations(newMess.conversation, newMess.message);
        
        
      })
    }

  ngOnInit(): void {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged() 
    );
    this.loadMatches();
    //this.loadMessages();
    this.loadConversations();
  }

  // ngAfterViewChecked() {
  //   this.cdRef.detectChanges();
  // }

  ngOnDestroy() {
    this.messageService.stopHubConnection();
  }
  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.XLarge)) {
      this.currentBreakpoint = Breakpoints.XLarge;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
      this.currentBreakpoint = Breakpoints.Large;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      this.currentBreakpoint = Breakpoints.Medium;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.currentBreakpoint = Breakpoints.Small;
    } else if(this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      this.currentBreakpoint = Breakpoints.XSmall;
    } 

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

  updateConversations(conversation?: Conversation, message?: Message) {
    
    console.log("component update conversation");
    console.log(this.conversations);
    console.log(conversation);
    console.log(message);
    // not in the message group
    if (conversation) {
      console.log("if conversation");
      // no conversations in the array so push new convo to the empty array
      if (this.conversations == null || this.conversations.length == 0) {
        this.conversations?.push(conversation);
        return;
      }
      // check if the convo is in the array
      let convoIndex = this.conversations?.findIndex((conv) => conv.otherUser === conversation.otherUser );
      // convo is in the array, update it with the new convo
      console.log("convoExists");
      console.log(convoIndex);
      // findIndex returns -1 if no conversation evaluates to true
      if (convoIndex !== undefined && convoIndex !== -1) {
        console.log("convoExists !== 1");
        this.conversations![convoIndex] = conversation;
      }
      else {
        console.log("convoPush");
        this.conversations?.push(conversation);
      }
      console.log("component update conversation end");
      console.log(this.conversations);
    }
    // currently in the message group
    else if (message) {
      console.log("if message");
      let didSend = message.senderUsername === this.user?.username;
      // If you are the sender, then the other user is the recipient of the message. If you're not the sender, then the other user is the sender
      let otherUser = didSend ? message.recipientUsername : message.senderUsername;
      let photoUrl = didSend ? message.recipientPhotoUrl: message.recipientPhotoUrl;
      let convoIndex = this.conversations?.findIndex((conv) => conv.otherUser === otherUser );
      if (convoIndex !== undefined && convoIndex !== -1) {
        const newConversation: Conversation = {
          otherUser: otherUser,
          otherUserPhotoUrl: photoUrl,
          isSender: didSend,
          content: message.content,
          messageSent: message.messageSent,
          dateRead: message.dateRead
        }
        console.log("convoExists !== 1");
        this.conversations![convoIndex] = newConversation;
      }
      // No need to check if it doesnt exist because the user must be in the message group meaning the conversation exists
      // Check here for cases of creating new conversation on match press
    }
    this.conversations = this.conversations?.sort((a, b) => new Date(b.messageSent).getTime() - new Date(a.messageSent).getTime());
    
    

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
    
    if (this.selectedUser == conversation.otherUser) return;

    if (this.selectedUser == null) {
      this.selectedUser = conversation.otherUser;
      this.messageService.createHubConnection(this.user!, conversation.otherUser);
    }
    else {
      this.messageService.stopHubConnection();
      this.selectedUser = conversation.otherUser;
      this.messageService.createHubConnection(this.user!, conversation.otherUser);
    }
    let convoIndex = this.conversations?.findIndex((conv) => conv.otherUser === conversation.otherUser );
    // convo is in the array, update the date read (updated separately in the db. This is temporary so the is read dot disappears on click. The date read for the convo is updated on new message with the date read from the db which is updated in the message hub if the user is in the group)
    // findIndex returns -1 if no conversation evaluates to true
    if (convoIndex !== undefined && convoIndex !== -1) {
      console.log("convoExists !== 1");
      this.conversations![convoIndex].dateRead = new Date(Date.now());
    }
  }
  
  selectMatch(event: any, match: Member) {

    if (this.selectedUser == match.username) return;

    if (this.selectedUser == null) { 
      this.selectedUser = match.username;
      this.messageService.createHubConnection(this.user!, match.username);
    }
    else {
      this.messageService.stopHubConnection();
      this.selectedUser = match.username;
      this.messageService.createHubConnection(this.user!, match.username);
    }
    let convoIndex = this.conversations?.findIndex((conv) => conv.otherUser === match.username );

    if (convoIndex !== undefined && convoIndex !== -1) return;

    else if (convoIndex !== undefined && convoIndex === -1) {
      const newConversation: Conversation = {
        otherUser: match.username,
        otherUserPhotoUrl: match.photoUrl,
        isSender: true,
        content: "",
        messageSent: new Date(Date.now()),
      }
      this.updateConversations(newConversation);
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
