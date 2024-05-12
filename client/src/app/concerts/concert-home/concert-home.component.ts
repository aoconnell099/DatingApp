import { Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ConcertListComponent } from '../concert-list/concert-list.component';
import { ConcertSearchComponent } from '../concert-search/concert-search.component';
import { NavigationStart, Router } from '@angular/router';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { ConcertParams } from 'src/app/_models/concertParams';
import { Concert } from 'src/app/_models/concert';
import { Pagination } from 'src/app/_models/paginations';
import { ConcertService } from 'src/app/_services/concert.service';

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
  concertParams?: ConcertParams;
  concerts: Concert[] = [];
  searchResult: Concert[] = [];
  concertToAdd?: Concert;
  pagination?: Pagination;
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

  constructor(private concertService: ConcertService, private router: Router, private renderer: Renderer2) { 
    this.concertParams = this.concertService.getConcertParams();
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

    // document?.getElementById("List")?.click();
    //this.openTab(, 'List');
    
    this.loadConcerts();
    this.openTab('PageLoad', 'List');
    //document?.getElementById("List")?.click();
  }

  loadConcerts() {
    if (this.concertParams) {
      this.concertService.getConcertsForUser(this.concertParams).subscribe({
        next: response => {
          if (response.result && response.pagination) { 
            this.concerts = response.result;
            this.pagination = response.pagination;
            console.log(this.concerts);
          }  
        }
      })
    } 
    
  }

  // ngAfterContentInit(): void {
  //   document?.getElementById("List")?.click();
  // }

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

  openTab($event: any, tabName: string) {
    //var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    const tabcontent = Array.from(document.getElementsByClassName("tab-content") as HTMLCollectionOf<HTMLElement>);
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    const tablinks =  Array.from(document.getElementsByClassName("tab-links") as HTMLCollectionOf<HTMLElement>);
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" tab-button", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    const tab = document.getElementById(tabName);
    //const sidenavContainer = Array.from(document.getElementsByClassName("mat-sidenav-content") as HTMLCollectionOf<HTMLElement>);
    const sidenavContainer = document.getElementById("sidenavContent");

    console.log(sidenavContainer);
    if (tab) {
      if (tabName == "List") {
        tab.style.display = "flex";
        tab.style.flexDirection = "column";
        // for (let i = 0; i < sidenavContainer.length; i++) {
        //   sidenavContainer[i].style.display = "flex !important";
        //   console.log(sidenavContainer[i].style.display);
        // }
        if (sidenavContainer) {
          //sidenavContainer.style.display = "flex";
          sidenavContainer.style.setProperty("display", "flex", "important");
          sidenavContainer.style.setProperty("flex-direction", "column", "important");
          sidenavContainer.style.setProperty("width", "100vw", "important");
        }
        
      }
      else if (tabName == "Search") {
        tab.style.display = "block";
        // for (let i = 0; i < sidenavContainer.length; i++) {
        //   sidenavContainer[i].style.display = "block !important";
        //   console.log(sidenavContainer[i].style.display);
        // }
        if (sidenavContainer) {
          //sidenavContainer.style.display = "block";
          sidenavContainer.style.setProperty("display", "block", "important");
        }
      }
      console.log(sidenavContainer?.style.display);
    }
    console.log($event);
    if ($event !== 'PageLoad') {
      $event.target.parentElement.className += " tab-button";
    }
    
  }

  ngOnDestroy(): void {
    console.log("concert home ondestroy");
  }

}
