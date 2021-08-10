import { Course } from './../model/course';
import { COURSES, findLessonsForCourse } from './../../../../server/db-data';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CoursesService } from "./courses.service";
import { HttpErrorResponse } from '@angular/common/http';

describe(`${CoursesService.name}`, () => {

  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        CoursesService,
      ]
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  })

  it('should retrieve all courses', () => {
    coursesService.findAllCourses()
      .subscribe(courses => {

        expect(courses).toBeTruthy('No courses returned');
        expect(courses.length).toBe(12, 'incorrect number of courses');
        const course = courses.find(courses => courses.id === 12);
        expect(course.titles.description).toBe('Angular Testing Course');

      });

    const req = httpTestingController.expectOne('/api/courses');
    expect(req.request.method).toEqual('GET');

    req.flush({
      payload: Object.values(COURSES),
    });

  });

  it('should retrive a course by id', () => {
    const courseId = 1;
    coursesService.findCourseById(courseId).subscribe(course => {

      expect(course.titles.description).toBe('Serverless Angular with Firebase Course');
      expect(course.id).toBe(courseId, 'wrong course id');
    });

    const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
    expect(req.request.method).toEqual('GET');
    req.flush(COURSES[courseId]);
  });


  it(`should save the course data`, () => {
    const course: Partial<Course> = {
      id: 3,
      titles: {
        description: 'Testing Course',
      }
    };

    coursesService.saveCourse(course.id, course).subscribe(course => {
      expect(course.id).toBe(3);
    });

    const req = httpTestingController.expectOne(`/api/courses/${course.id}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.titles.description).toEqual(course.titles.description);

    req.flush({
      ...COURSES[course.id],
      ...course
    });

  });

  it('should give an error if save couse fails', () => {
    const course: Partial<Course> = {
      id: 3,
      titles: {
        description: 'Testing Course',
      }
    };
    coursesService.saveCourse(course.id, course).subscribe(
      () => fail('the save course operation should have failed'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      });

    const req = httpTestingController.expectOne(`/api/courses/${course.id}`);
    expect(req.request.method).toEqual('PUT');

    req.flush('Save course failed', { status: 500, statusText: 'Internal Server Error' });

  });

  it('should find a list of lessons', () => {
    const lessonId = 12;
    coursesService.findLessons(lessonId).subscribe(lesson => {
      expect(lesson).toBeTruthy();
      expect(lesson.length).toBe(3);
    });

    const req = httpTestingController.expectOne(req => req.url === `/api/lessons`);
    expect(req.request.method).toBe("GET");
    expect(req.request.params.get("courseId")).toEqual(String(lessonId));
    expect(req.request.params.get("filter")).toEqual('');
    expect(req.request.params.get("sortOrder")).toEqual('asc');
    expect(req.request.params.get("pageNumber")).toEqual('0');
    expect(req.request.params.get("pageSize")).toEqual('3');

    req.flush({
      payload: findLessonsForCourse(lessonId).slice(0, 3),
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  })
});
