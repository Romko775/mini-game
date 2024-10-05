import {Injectable} from '@angular/core';
import {debounceTime, filter, map, share, Subject, Subscription, tap} from "rxjs";
import {GameEvents, GameStates} from "../../core/enums";

interface IBoardConfig {
  sideCount: number;
  timeLimit: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameRunnerService {
  public readonly defaultSideCount = 10;
  public readonly defaultTimeLimit = 1000;

  private _playerScore = 0;
  private _computerScore = 0;

  private _activeCell: { x: number, y: number } | null = null;
  private _board = new Map();

  private _gameSub: Subscription | null = null;

  private _gameEvents = new Subject<GameEvents>();
  public gameEvents = this._gameEvents.asObservable().pipe(share());

  private _sideCount = this.defaultSideCount;
  private _timeLimit = this.defaultTimeLimit;

  private _range: number[] = [];

  public get playerScore(): number {
    return this._playerScore;
  }

  public get computerScore(): number {
    return this._computerScore;
  }

  public get range(): number[] {
    return this._range;
  }

  public getCellState(x: number, y: number): GameStates | null | undefined {
    return this._board.get(this.getBoardCellKey(x, y));
  }

  public initBoard(config: IBoardConfig): void {
    this._sideCount = config.sideCount || this.defaultSideCount;
    this._timeLimit = config.timeLimit || this.defaultTimeLimit;
    this.resetBoard();
  }

  protected resetBoard(): void {
    this._range = this.createRange(this._sideCount);
    this._range.forEach((i) => {
      this._range.forEach((j) => {
        this.setCellState(i, j, null);
      });
    });
    this._gameSub?.unsubscribe();
    this._gameEvents.next(GameEvents.BoardUpdated);
  }

  public startGame(): void {
    this.resetScore();
    this.resetBoard();

    this._gameSub?.unsubscribe();
    this._gameSub = this.gameEvents
      .pipe(
        filter((e) => e === GameEvents.RoundStart),
        debounceTime(this._timeLimit),
        map(() => this._activeCell),
        filter(Boolean),
        tap(({x, y}) => {
          if (this.getCellState(x, y) === GameStates.Pending) {
            this.setCellState(x, y, GameStates.Lost);
            this._computerScore++;
          }
          this._gameEvents.next(GameEvents.BoardUpdated);
          this.checkGameStatus();
        })
      )
      .subscribe();

    this.runGameRound();
  }

  public runGameRound(): void {
    const availableCells = Array.from(this._board.keys()).filter(key => !this._board.get(key));
    const nextCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    const [x, y] = this.getBoardCoordsFromKey(nextCell);
    this.setCellState(x, y, GameStates.Pending);
    this._activeCell = {x, y};
    this._gameEvents.next(GameEvents.RoundStart);
  }

  public onCellClick(x: number, y: number): void {
    if (this.getCellState(x, y) !== GameStates.Pending) return;
    this.setCellState(x, y, GameStates.Point);
    this._playerScore++;
    this.checkGameStatus();
  }

  /**
   * Private methods
   */

  private getBoardCellKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  private getBoardCoordsFromKey(key: string): number[] {
    return key.split(':').map(Number);
  }

  private resetScore(): void {
    this._playerScore = 0;
    this._computerScore = 0;
  }

  private createRange(sideCount: number): number[] {
    return [...Array(sideCount).keys()]
  }

  private setCellState(x: number, y: number, state: GameStates | null): void {
    this._board.set(this.getBoardCellKey(x, y), state);
  }

  private checkGameStatus(): void {
    if (this._playerScore >= 10 || this._computerScore >= 10) {
      console.log('Game end');
      this._gameEvents.next(GameEvents.GameEnded);
      this._gameSub?.unsubscribe();
      return;
    }
    this.runGameRound();
  }
}
