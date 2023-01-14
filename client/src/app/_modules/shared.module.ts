import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ToastrModule } from 'ngx-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';
//import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from  'ng-gallery/lightbox';
import { FileUploadModule } from 'ng2-file-upload';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ButtonsModule } from 'ngx-bootstrap/buttons'
import { TimeagoModule } from 'ngx-timeago';
import { MomentModule } from 'ngx-moment';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    TabsModule.forRoot(),
    //NgxGalleryModule,
    GalleryModule,
    LightboxModule,
    FileUploadModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    ButtonsModule.forRoot(),
    MomentModule.forRoot(),
    ModalModule.forRoot()
  ],
  exports: [
    BsDropdownModule,
    ToastrModule,
    TabsModule,
    //NgxGalleryModule,
    GalleryModule,
    LightboxModule,
    FileUploadModule,
    BsDatepickerModule,
    PaginationModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    ButtonsModule,
    MomentModule,
    ModalModule
  ]
})
export class SharedModule { }
