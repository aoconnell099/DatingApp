import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-confirm-logout',
  templateUrl: './confirm-logout.component.html',
  styleUrls: ['./confirm-logout.component.scss']
})
export class ConfirmLogoutComponent implements OnInit {

  constructor(public accountService: AccountService, private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

}
