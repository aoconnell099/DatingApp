import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/paginations';
import { ConfirmService } from '../_services/confirm.service';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages?: Message[]; // Previously = []..changed for delete messages
  pagination?: Pagination;
  container = 'Unread';
  pageNumber = 1;
  pageSize = 5;
  loading = false;

  constructor(private messageService: MessageService, private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.loadMessages();
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
        if (response.result && response.pagination) {
          this.messages = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
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

  pageChanged(event: any) {
    if (this.pageNumber != event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
    
  }

}
