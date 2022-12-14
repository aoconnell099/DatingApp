import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, map } from 'rxjs';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  bsModalRef?: BsModalRef;

  constructor(private modalService: BsModalService) { }

  confirm(title = 'Confirmation', 
    message = 'Are you sure you want to do this?', 
    btnOkText = 'Ok', 
    btnCancelText = 'Cancel'
    ): Observable<boolean> {
      const config = {
        initialState: {
          title,
          message,
          btnOkText,
          btnCancelText
        }
      }
      this.bsModalRef = this.modalService.show(ConfirmDialogComponent, config);
      // Exclamation point at the end of a variable tells the compiler to ignore the possibility of it being undefined
      return this.bsModalRef.onHidden!.pipe(
        map(() => {
          return this.bsModalRef!.content!.result
        })
      )
    }
  }

// Previously returned the result of this method when strict mode was turned off
//     private getResult() {
//       return (observer: any) => {
//         const subscription = this.bsModalRef.onHidden.subscribe(() => {
//           observer.next(this.bsModalRef.content.result);
//           observer.complete();
//         });

//         return {
//           unsubscribe() {
//             subscription.unsubscribe();
//           }
//         }
//       }
//     }
// }
