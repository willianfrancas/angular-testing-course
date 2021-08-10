import { LoggerService } from './logger.service';
import { TestBed } from '@angular/core/testing';
import { CalculatorService } from "./calculator.service";

describe(`${CalculatorService.name}`, () => {

  let calculator: CalculatorService;
  let loggerSpy: any;

  beforeEach(() => {

    loggerSpy = jasmine.createSpyObj('LoggerService', ['log']);
    calculator = new CalculatorService(loggerSpy);

    TestBed.configureTestingModule({
      providers: [
        CalculatorService,
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });
    calculator = TestBed.inject(CalculatorService);

  });

  it('should add two numbers', () => {

    const result = calculator.add(2, 4);
    expect(result).toBe(2 + 4);
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });

  it('should subtract two numbers', () => {
    const result = calculator.subtract(2, 4);
    expect(result).toBe(2 - 4);
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });
});
