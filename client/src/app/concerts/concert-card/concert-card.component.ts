import { Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { Concert } from 'src/app/_models/concert';

@Component({
  selector: 'app-concert-card',
  templateUrl: './concert-card.component.html',
  styleUrls: ['./concert-card.component.scss']
})
export class ConcertCardComponent implements OnInit {
  @Input() concert?: Concert;
  @Input() currentBreakpoint?: string;
  Breakpoints = Breakpoints;
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  
  constructor() { }

  ngOnInit(): void {
  }

}
