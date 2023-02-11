import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConcertHomeComponent } from '../concerts/concert-home/concert-home.component';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FocusKeyManagerGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the component has a _keyManager property
    if (component['_keyManager']) {
      // Call the destroy method on the _keyManager property
      component['_keyManager'].destroy();
    }

    return component.canDeactivate();
    
      return true;
  }
  
}
