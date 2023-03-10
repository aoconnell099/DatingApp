import { Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Concert } from 'src/app/_models/concert';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-concert-card',
  templateUrl: './concert-card.component.html',
  styleUrls: ['./concert-card.component.scss']
})
export class ConcertCardComponent implements OnInit {
  @ViewChild('cardImg') cardImg?: ElementRef;
  @Input() concert?: Concert;
  @Input() currentBreakpoint?: string;
  @Output() remove: EventEmitter<Concert> = new EventEmitter();
  Breakpoints = Breakpoints;
  smallerBreakpoint = '(max-width: 800px) and (min-width: 600px)';
  isDefaultImage: boolean = false;
  imgSrc?: string;
  userImgSrc: string = './assets/user.png';
  fullUserImgSrc: string = "https://localhost:4200/assets/user.png";
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    //this.imgSrc = this.cardImg?.nativeElement.src;

    if (this.cardImg?.nativeElement) {
      this.isDefaultImage = this.cardImg?.nativeElement.src.includes('assets/user.png') ? true : false;
      console.log(this.isDefaultImage);
    }
    
  }

  ngAfterContentInit(): void {
    
    // this.isDefaultImage = this.cardImg?.nativeElement.src.includes('assets/user.png') ? true : false;
    // console.log(this.isDefaultImage);
  }

  removeUserConcert() {
    if (this.concert) {
      console.log(this.concert);
      this.remove.emit(this.concert);
    }
    
  }

}
