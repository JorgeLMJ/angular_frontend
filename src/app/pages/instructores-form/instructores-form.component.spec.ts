import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructoresFormComponent } from './instructores-form.component';

describe('InstructoresFormComponent', () => {
  let component: InstructoresFormComponent;
  let fixture: ComponentFixture<InstructoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructoresFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
