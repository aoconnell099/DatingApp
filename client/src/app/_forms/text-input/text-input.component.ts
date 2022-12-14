import { Component, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';

  constructor(@Self() public ngControl: NgControl) { // The self decorator ensures that angular will always inject what's here locally into this component instead of reusing another instance of this.
    this.ngControl.valueAccessor = this; // This gives access to the control inside of this component when you use it inside the register form
  } 

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
  }

  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }

}
