import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsGridComponent } from './analytics-grid.component';

describe('AnalyticsGridComponent', () => {
  let component: AnalyticsGridComponent;
  let fixture: ComponentFixture<AnalyticsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
