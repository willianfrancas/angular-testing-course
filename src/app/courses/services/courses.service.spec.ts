import { Course } from './../model/course';
import { COURSES, findLessonsForCourse } from './../../../../server/db-data';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CoursesService } from './courses.service';
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
  });

  it('should retrieve all courses', () => {
    coursesService.findAllCourses()
      .subscribe(courses => {

        expect(courses).toBeTruthy('No courses returned');
        expect(courses.length).toBe(12, 'incorrect number of courses');
        const course = courses.find(coursesF => coursesF.id === 12);
        expect(course.titles.description).toBe('Angular Testing Course');

      });

    const reqs = httpTestingController.expectOne('/api/courses');
    expect(reqs.request.method).toEqual('GET');

    reqs.flush({
      payload: Object.values(COURSES),
    });

  });

  it('should retrive a course by id', () => {
    const courseId = 1;
    coursesService.findCourseById(courseId).subscribe(course => {

      expect(course.titles.description).toBe('Serverless Angular with Firebase Course');
      expect(course.id).toBe(courseId, 'wrong course id');
    });

    const reqC = httpTestingController.expectOne(`/api/courses/${courseId}`);
    expect(reqC.request.method).toEqual('GET');
    reqC.flush(COURSES[courseId]);
  });


  it(`should save the course data`, () => {
    const courseObj: Partial<Course> = {
      id: 3,
      titles: {
        description: 'Testing Course',
      }
    };

    coursesService.saveCourse(courseObj.id, courseObj).subscribe(courseS => {
      expect(courseS.id).toBe(3);
    });

    const reqI = httpTestingController.expectOne(`/api/courses/${courseObj.id}`);
    expect(reqI.request.method).toEqual('PUT');
    expect(reqI.request.body.titles.description).toEqual(courseObj.titles.description);

    reqI.flush({
      ...COURSES[courseObj.id],
      ...courseObj
    });

  });

  it('should give an error if save couse fails', () => {
    const courseObjf: Partial<Course> = {
      id: 3,
      titles: {
        description: 'Testing Course',
      }
    };
    coursesService.saveCourse(courseObjf.id, courseObjf).subscribe(
      () => fail('the save course operation should have failed'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      });

    const reqO = httpTestingController.expectOne(`/api/courses/${courseObjf.id}`);
    expect(reqO.request.method).toEqual('PUT');

    reqO.flush('Save course failed', { status: 500, statusText: 'Internal Server Error' });

  });

  it('should find a list of lessons', () => {
    const lessonId = 12;
    coursesService.findLessons(lessonId).subscribe(lesson => {
      expect(lesson).toBeTruthy();
      expect(lesson.length).toBe(3);
    });

    const reqL = httpTestingController.expectOne(req => req.url === `/api/lessons`);
    expect(reqL.request.method).toBe('GET');
    expect(reqL.request.params.get('courseId')).toEqual(String(lessonId));
    expect(reqL.request.params.get('filter')).toEqual('');
    expect(reqL.request.params.get('sortOrder')).toEqual('asc');
    expect(reqL.request.params.get('pageNumber')).toEqual('0');
    expect(reqL.request.params.get('pageSize')).toEqual('3');

    reqL.flush({
      payload: findLessonsForCourse(lessonId).slice(0, 3),
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
