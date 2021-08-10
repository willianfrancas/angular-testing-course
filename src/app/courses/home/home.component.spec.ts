import { CoursesService } from './../services/courses.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CoursesModule } from './../courses.module';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { setupCourses } from '../common/setup-test-data';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { click } from '../common/test-utils';
import { async } from 'rxjs/internal/scheduler/async';

describe(`${HomeComponent.name}`, () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let el: DebugElement;
  let coursesService: any;

  const beginnerCourses = setupCourses()
    .filter(course => course.category === 'BEGINNER');
  const advancedCourses = setupCourses()
    .filter(course => course.category === 'ADVANCED');

  beforeEach(waitForAsync(() => {

    const courseServiceSpy = jasmine.createSpyObj('CoursesService', ['findAllCourses']);

    TestBed.configureTestingModule({
      imports: [
        CoursesModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: CoursesService,
          useValue: courseServiceSpy
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        coursesService = TestBed.inject(CoursesService);
      });

  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display only beginner courses', () => {
    coursesService.findAllCourses.and.returnValue(of(beginnerCourses));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css('.mat-tab-label'));
    expect(tabs.length).toBe(1, 'Unexpected number of tabs found');
  });

  it('should display only advanced courses', () => {
    coursesService.findAllCourses.and.returnValue(of(advancedCourses));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css('.mat-tab-label'));
    expect(tabs.length).toBe(1, 'Unexpected number of tabs found');
  });

  it('should display both tabs', () => {
    coursesService.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css('.mat-tab-label'));
    expect(tabs.length).toBe(2, 'Expected to find 2 tabs');
  });

  it('should display advanced courses when tab clicked', () => {
    coursesService.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css('.mat-tab-label'));
    click(tabs[1]);
    fixture.detectChanges();
    const cardTitles = el.queryAll(By.css('.mat-card-title'));
    expect(cardTitles.length).toBeGreaterThan(0, 'Could not find card titles');
    expect(cardTitles[0].nativeElement.textContent)
      .toContain('Angular Security Course');

  });
});
