import {Injectable, Signal, signal} from '@angular/core';
import {debounceTime, filter, share, Subject, Subscription, tap} from "rxjs";
import {GameEvents, GameStates} from "../../core/enums";

interface IGameConfig {
  timeLimit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameRunnerService {
  public readonly defaultTimeLimit = 1000;
  public readonly sideCount = 10;

  private _playerScore = signal(0);
  private _computerScore = signal(0);

  private _activeCell: { x: number, y: number } | null = null;
  private _board = new Map();

  private _gameSub: Subscription | null = null;

  private _gameEvents = new Subject<GameEvents>();
  public gameEvents = this._gameEvents.asObservable().pipe(share());

  private _timeLimit = this.defaultTimeLimit;

  private _range: number[] = [];

  public get playerScore(): Signal<number> {
    return this._playerScore;
  }

  public get computerScore(): Signal<number> {
    return this._computerScore;
  }

  /**
   * @desc Get range of cells per side.
   */
  public get range(): number[] {
    return this._range;
  }

  /**
   * @desc Get active cell coords for round.
   */
  public get activeCell(): { x: number, y: number } | null {
    return this._activeCell;
  }

  /**
   * @desc Get cell state per game.
   */
  public getCellState(x: number, y: number): GameStates | null | undefined {
    return this._board.get(this.getBoardCellKey(x, y));
  }

  /**
   * @desc Build board data placeholder.
   */
  public initBoard(): void {
    this._range = this.createRange(this.sideCount);
    this._range.forEach((i) => {
      this._range.forEach((j) => {
        this.setCellState(i, j, null);
      });
    });
  }

  /**
   * @desc Start game. If time limit not set or invalid it would use default value.
   */
  public startGame(config: IGameConfig): void {
    this._timeLimit = (config.timeLimit && typeof config.timeLimit === "number")
      ? config.timeLimit
      : this.defaultTimeLimit;

    this.resetScore();
    this.resetBoard();

    this._gameSub?.unsubscribe();
    this._gameSub = this.gameEvents
      .pipe(
        filter((e) => e === GameEvents.RoundStart),
        debounceTime(this._timeLimit),
        tap(() => this.handleGameRoundTimeout()),
      )
      .subscribe();

    this.runGameRound();
  }

  /**
   * @desc Cell click handler to update score.
   */
  public onCellClick(x: number, y: number): void {
    if (this.getCellState(x, y) !== GameStates.Pending) return;
    this.setCellState(x, y, GameStates.Point);
    this._playerScore.update(v => v + 1);
    this.checkGameStatus();
  }

  /**
   * Private methods
   */

  /**
   * @desc Build unique key for board cell.
   */
  private getBoardCellKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  /**
   * @desc Parse board cell key.
   */
  private getBoardCoordsFromKey(key: string): number[] {
    return key.split(':').map(Number);
  }

  /**
   * @desc Reset all score data.
   */
  private resetScore(): void {
    this._playerScore.set(0);
    this._computerScore.set(0);
  }

  /**
   * @desc Reset board.
   * @emits 'BoardUpdated' event
   */
  private resetBoard(): void {
    this._gameSub?.unsubscribe();
    this._board.clear();
    this.initBoard();
    this._gameEvents.next(GameEvents.BoardUpdated);
  }

  /**
   * @desc One round runner. Updates cell status to 'Pending'.
   * @emits 'RoundStart' event.
   */
  private runGameRound(): void {
    const availableCells = Array.from(this._board.keys()).filter(key => !this._board.get(key));
    const nextCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    const [x, y] = this.getBoardCoordsFromKey(nextCell);
    this.setCellState(x, y, GameStates.Pending);
    this._activeCell = {x, y};
    this._gameEvents.next(GameEvents.RoundStart);
  }

  /**
   * @desc Build range.
   */
  private createRange(sideCount: number): number[] {
    return [...Array(sideCount).keys()]
  }

  /**
   * @desc Updates cell game status.
   */
  private setCellState(x: number, y: number, state: GameStates | null): void {
    this._board.set(this.getBoardCellKey(x, y), state);
  }

  /**
   * @desc Handles round timeout and scores computer.
   * @emits 'BoardUpdated' event.
   */
  private handleGameRoundTimeout(): void {
    if (!this._activeCell) return;
    const {x, y} = this._activeCell;
    if (this.getCellState(x, y) === GameStates.Pending) {
      this.setCellState(x, y, GameStates.Lost);
      this._computerScore.update(v => v + 1);
    }
    this._gameEvents.next(GameEvents.BoardUpdated);
    this.checkGameStatus();
  }

  /**
   * @desc Game status checker.
   * @emits 'GameEnded' event when score reaches 10 per playing side.
   * Starts new round while game still valid.
   */
  private checkGameStatus(): void {
    if (this._playerScore() >= 10 || this._computerScore() >= 10) {
      this._gameEvents.next(GameEvents.GameEnded);
      this._gameSub?.unsubscribe();
      return;
    }
    this.runGameRound();
  }
}
