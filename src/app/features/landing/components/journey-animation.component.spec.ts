import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyAnimationComponent } from './journey-animation.component';

describe('JourneyAnimationComponent', () => {
  let component: JourneyAnimationComponent;
  let fixture: ComponentFixture<JourneyAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneyAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JourneyAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
