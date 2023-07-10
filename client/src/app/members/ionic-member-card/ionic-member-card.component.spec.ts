import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IonicMemberCardComponent } from './ionic-member-card.component';

describe('IonicMemberCardComponent', () => {
  let component: IonicMemberCardComponent;
  let fixture: ComponentFixture<IonicMemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IonicMemberCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IonicMemberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
