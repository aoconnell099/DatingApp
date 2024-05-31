import { Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Concert } from 'src/app/_models/concert';
import { Inject } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-match-dialog',
  templateUrl: './match-dialog.component.html',
  styleUrl: './match-dialog.component.scss',
  animations: [
	  trigger('visibleHidden', [
		state(
			'visible',
			style({
				transform: 'translate(-50%, 0%) scale(1)',
				opacity: 1,
			})
		),
		state(
			'void, hidden',
			style({
				transform: 'translate(-50%, 0%) scale(0.8)',
				opacity: 0,
			})
		),
		transition('* => visible', animate('500ms')),
		transition('* => void, * => hidden', animate('250ms'))
	  ]),
	],
})
export class MatchDialogComponent {
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  isVisible = false;
	
  
  constructor( @Inject(MAT_DIALOG_DATA) public member: Member) { }

  ngOnInit(): void {
  }

  toggle() {
		this.isVisible = !this.isVisible;
	}
}
