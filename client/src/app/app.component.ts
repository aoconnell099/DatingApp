import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { PresenceService } from './_services/presence.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'The Dating App';
  users: any;

  constructor(private accountService: AccountService, private presence: PresenceService,
      private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry
      .addSvgIcon("full-stage", this.domSanitizer
      .bypassSecurityTrustResourceUrl("../assets/icons/full-stage.svg"))
      .addSvgIcon("stage-lights-star-1", this.domSanitizer
      .bypassSecurityTrustResourceUrl("../assets/icons/stage-lights-star-1.svg")

      );
  }
  
  ngOnInit() {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user: User = JSON.parse(userString);
    this.accountService.setCurrentUser(user);
    // if (user) {
    //   this.accountService.setCurrentUser(user);
    //   this.presence.createHubConnection(user);
    // }
    
  }


}
