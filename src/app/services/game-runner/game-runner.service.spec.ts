import { TestBed } from '@angular/core/testing';

import { GameRunnerService } from './game-runner.service';

describe('GameRunnerService', () => {
  let service: GameRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
