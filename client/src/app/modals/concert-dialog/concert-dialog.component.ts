import { Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Concert } from 'src/app/_models/concert';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-concert-dialog',
  templateUrl: './concert-dialog.component.html',
  styleUrls: ['./concert-dialog.component.scss']
})
export class ConcertDialogComponent implements OnInit {
  //@Input() concert?: Concert;
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  
  constructor( @Inject(MAT_DIALOG_DATA) public concert: Concert) { }

  ngOnInit(): void {
  }

}
