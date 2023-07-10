import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
  encapsulation : ViewEncapsulation.None,
})
export class LoginDialogComponent implements OnInit {
  hide = true;
  model:any = {};
  constructor(public accountService: AccountService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    // console.log(this.model.username);
    // console.log(this.model.password);
    console.log('login');
    this.accountService.login(this.model).subscribe(response => {
      console.log('login log');
      console.log(localStorage.getItem('user'));
      this.router.navigateByUrl('/members');
    });
  }

}
