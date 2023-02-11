import { Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ConcertListComponent } from '../concert-list/concert-list.component';
import { ConcertSearchComponent } from '../concert-search/concert-search.component';
import { NavigationStart, Router } from '@angular/router';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FocusKeyManager } from '@angular/cdk/a11y';

@Component({
  selector: 'app-concert-home',
  templateUrl: './concert-home.component.html',
  styleUrls: ['./concert-home.component.scss']
})
export class ConcertHomeComponent implements OnInit, OnDestroy {
  @ViewChild('concertList') concertList!: ConcertListComponent;
  @ViewChild('concertSearch') concertSearch!: ConcertSearchComponent;
  @ViewChild('concertListTab') concertListTab!: MatTab;
  @ViewChild('concertSearchTab') concertSearchTab!: MatTab;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(event: any) {
    // logic to handle the beforeunload event
    console.log("before unload handler");
    // console.log(event);
    // this.concertList.ngOnDestroy();
    // this.concertSearch.ngOnDestroy();
    // document.getElementById("concertList")?.remove();
    // document.getElementById("concertSearch")?.remove();
    // console.log(document.getElementById("concertList"));
  }
  keyManager: any;
  isNavigating: boolean = false;

  constructor(private router: Router, private renderer: Renderer2) { 
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     console.log('Navigation started!');
    //     console.log(event);
    //     this.concertList.ngOnDestroy();
    //     this.concertSearch.ngOnDestroy();
    //     document.getElementById("concertList")?.remove();
    //     document.getElementById("concertSearch")?.remove();
    //     console.log(document.getElementById("concertList"));
    //   }
    // });
  }

  // ngAfterViewInit() {
  //   console.log(this.tabGroup._keyManager);
  // }

  cleanup(): void {
    console.log("concert home cleanup");
    console.log(this.tabGroup);

    // this.concertListTab.ngOnDestroy();
    // this.concertSearchTab.ngOnDestroy();

    
    // document.getElementById("concertListTab")?.remove();
    // document.getElementById("concertSearchTab")?.remove();
    document.getElementById("tabGroup")?.remove();
    this.tabGroup.ngOnDestroy();

    console.log(this.tabGroup);
    console.log(this.isNavigating);
    this.isNavigating = true;
    console.log(this.isNavigating);
    //this.tabGroup._tabHeader.ngOnDestroy();
    //this.renderer.removeChild(document.getElementById("tabGroupParent"), document.getElementById("tabGroup"));
    
    // document.getElementById("concertList")?.remove();
    // document.getElementById("concertSearch")?.remove();
    // this.tabGroup._elementRef.nativeElement.remove();
    // console.log(this.tabGroup);
  }

  ngOnDestroy(): void {
    console.log("concert home ondestroy");
  }

}
