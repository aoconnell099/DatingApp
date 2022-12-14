import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormControl, UntypedFormGroup, ValidatorFn, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  //registerForm: UntypedFormGroup;
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  //validationErrors: string[] = []; // Need to initialize because we check for the length in the component html
  validationErrors?: string[];
  constructor(private accountService: AccountService, private toastr: ToastrService,
     private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() -18);
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required,
        Validators.minLength(4), Validators.maxLength(16)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      }
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => { /* Get access to the control that you attach the validator to. 
                                              We're attaching to the confirmPassword control, and comparing 
                                              it to whatever is being passed to the matchTo. In this case we're 
                                              passing in the password that we want to compare this value to. 
                                              If these passwords match, then return null and validation passes. 
                                              If not then we attach a validator error called isMatching to the 
                                              control and this will fail the form validation */
      // return control?.value === control?.parent?.controls[matchTo].value 
      //   ? null : {isMatching: true}
      return control.value === control.parent?.get(matchTo)?.value ? null : {notMatching: true}
    }
  }

  register() {
    // this.accountService.register(this.registerForm.value).subscribe(response => {
    //   this.router.navigateByUrl('/members');
    //   this.cancel();
    // }), error => {
    //   this.validationErrors = error;
    // }

    const dob = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    const values = {...this.registerForm.value, dateOfBirth: dob};
    this.accountService.register(values).subscribe({
      next: () => {
        this.router.navigateByUrl('/members')
      },
      error: error => {
        this.validationErrors = error
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob?: string) {
    if (!dob) return;
    let theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes()-theDob.getTimezoneOffset()))
      .toISOString().slice(0,10);
  }

}
