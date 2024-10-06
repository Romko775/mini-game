import {GameRunnerService} from "./game-runner.service";
import {TestBed} from "@angular/core/testing";

describe('GameRunnerService', () => {
  let service: GameRunnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameRunnerService]
    });
    service = TestBed.inject(GameRunnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initBoard', () => {
    it('should initialize the board with the correct range and cell states', () => {
      service.initBoard();
      expect(service.range.length).toBe(service.sideCount);

      service.range.forEach(x => {
        service.range.forEach(y => {
          expect(service.getCellState(x, y)).toBeNull();
        });
      });
    });
  });

  describe('startGame', () => {
    it('should start the game with a default time limit if not provided', () => {
      const defaultTimeLimit = service.defaultTimeLimit;
      const config = {timeLimit: undefined};

      service.startGame(config);
      expect(service['_timeLimit']).toBe(defaultTimeLimit);
    });

    it('should reset score and board on game start', () => {
      const resetScoreSpy = spyOn<any>(service, 'resetScore').and.callThrough();
      const resetBoardSpy = spyOn<any>(service, 'resetBoard').and.callThrough();

      service.startGame({timeLimit: 2000});
      expect(resetScoreSpy).toHaveBeenCalled();
      expect(resetBoardSpy).toHaveBeenCalled();
    });
  });

  describe('onCellClick', () => {
    it('should increment player score when clicking a pending cell', () => {
      service.initBoard();
      service.startGame();

      const {x, y} = service.activeCell!;
      service.onCellClick(x, y);
      expect(service.playerScore()).toBe(1);
    });

    it('should not increment score if cell is not pending', () => {
      service.initBoard();
      service.onCellClick(0, 0);
      expect(service.playerScore()).toBe(0);
    });
  });
});

