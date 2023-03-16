import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { ButtonsModule } from 'ngx-bootstrap/buttons'
import { TimeagoModule } from 'ngx-timeago';
import { MomentModule } from 'ngx-moment';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SwiperModule } from 'swiper/angular';
import { IonicModule } from '@ionic/angular';



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
    MatCardModule,
    MatSlideToggleModule,
    MatListModule,
    MatGridListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatRadioModule,
    MatExpansionModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    IonicModule.forRoot(),
    SwiperModule,
    TabsModule.forRoot(),
    //NgxGalleryModule,
    GalleryModule,
    LightboxModule,
    FileUploadModule,
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    ButtonsModule.forRoot(),
    MomentModule.forRoot(),
    ModalModule.forRoot(),
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
    MatCardModule, 
    MatSlideToggleModule,
    MatListModule,
    MatGridListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    MatTableModule,
    MatExpansionModule,
    MatTabsModule,
    MatInputModule,
    MatDialogModule,
    MatPaginatorModule,
    ButtonsModule,
    MomentModule,
    ModalModule,
    SwiperModule,
    IonicModule,
  ]
})
export class SharedModule { }
