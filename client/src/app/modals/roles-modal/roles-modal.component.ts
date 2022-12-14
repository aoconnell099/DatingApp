import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.scss']
})
export class RolesModalComponent implements OnInit {
 /*@Input() updateSelectedRoles = new EventEmitter();  For the bsConfig we pass this into its content property so it needs to be an input here, 
                                                        but we want it to output the roles so we need to use an event emitter.
                                                     */
  // user: User;
  // roles: any[];
  username = '';
  availableRoles: any[] = [];
  selectedRoles: any[] = [];

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
  }

  updateChecked(checkedValue: string) {
    const index = this.selectedRoles.indexOf(checkedValue);
    index !== -1 ? this.selectedRoles.splice(index, 1) : this.selectedRoles.push(checkedValue);
  }

  // updateRoles() {
  //   this.updateSelectedRoles.emit(this.roles);
  //   this.bsModalRef.hide();
  // }

}