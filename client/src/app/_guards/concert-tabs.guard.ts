import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConcertHomeComponent } from '../concerts/concert-home/concert-home.component';

@Injectable({
  providedIn: 'root'
})
export class ConcertTabsGuard implements CanDeactivate<ConcertHomeComponent> {
  canDeactivate(component: ConcertHomeComponent): boolean {
      console.log("inside of can deactivate");
      console.log(component);
      component.cleanup();

    return false;
  }
  
}
