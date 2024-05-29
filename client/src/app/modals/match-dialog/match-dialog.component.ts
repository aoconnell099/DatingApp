import { Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Concert } from 'src/app/_models/concert';
import { Inject } from '@angular/core';
import { Member } from 'src/app/_models/member';

@Component({
  selector: 'app-match-dialog',
  templateUrl: './match-dialog.component.html',
  styleUrl: './match-dialog.component.scss'
})
export class MatchDialogComponent {
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  
  constructor( @Inject(MAT_DIALOG_DATA) public member: Member) { }

  ngOnInit(): void {
  }
}
