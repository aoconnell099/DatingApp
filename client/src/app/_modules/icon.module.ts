import { NgModule } from "@angular/core"; 
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"; 
import { MatIconModule, MatIconRegistry } from "@angular/material/icon"; 
@NgModule() 
export class IconModule { 
private path: string = "../../assets/icons";
 constructor(
  private domSanitizer: DomSanitizer, 
  public matIconRegistry: MatIconRegistry ) {
  this.matIconRegistry
  .addSvgIcon("home", this.setPath(`${this.path}/full-stage.svg`))
  .addSvgIcon("add", this.setPath(`${this.path}/stage-lights-star-1.svg`));
 }
 private setPath(url: string): SafeResourceUrl { 
  return this.domSanitizer.bypassSecurityTrustResourceUrl(url); 
 }
}