import {ComponentFixture, TestBed} from '@angular/core/testing';
import { AppComponent } from './app.component';
import {NO_ERRORS_SCHEMA, signal} from "@angular/core";
import {GameRunnerService} from "./services/game-runner/game-runner.service";
import {Subject} from "rxjs";
import {GameEvents} from "./core/enums";
import {ModalService} from "./services/modal/modal.service";

const mockGameEvents = new Subject<GameEvents>();

const mockGameRunnerService = {
  defaultTimeLimit: 1000,
  startGame: jasmine.createSpy('startGame'),
  gameEvents: mockGameEvents.asObservable(),
  playerScore: signal(0)
}

const mockModalService = {
  open: jasmine.createSpy('open'),
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: GameRunnerService, useValue: mockGameRunnerService },
        { provide: ModalService, useValue: mockModalService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should start game', () => {
    component.startGame();
    expect(mockGameRunnerService.startGame).toHaveBeenCalledWith(jasmine.objectContaining({
      timeLimit: 1000
    }))
  });

  describe('game ended', () => {
    it('should subscribe for game events on init and message player won', () => {
      mockGameRunnerService.playerScore.set(10);
      component.ngOnInit();
      mockGameEvents.next(GameEvents.GameEnded);
      expect(mockModalService.open).toHaveBeenCalledWith('Player won');
    });

    it('should subscribe for game events on init and message player won', () => {
      mockGameRunnerService.playerScore.set(9);
      component.ngOnInit();
      mockGameEvents.next(GameEvents.GameEnded);
      expect(mockModalService.open).toHaveBeenCalledWith('Computer won');
    });
  })
});
