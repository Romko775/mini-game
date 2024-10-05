import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, OnInit} from '@angular/core';
import {GameStates} from "../../core/enums";
import {debounceTime, filter, map, Subject, Subscription, tap} from "rxjs";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameBoardComponent implements OnInit {
  private readonly defaultSideCount = 10;
  private readonly defaultTimeLimit = 1000;

  private cdr = inject(ChangeDetectorRef);

  private activeCell: { x: number, y: number } | null = null;
  private roundStart = new Subject<void>();
  private gameSub: Subscription | null = null;
  private board = new Map();

  public sideCount = input<number>(this.defaultSideCount);
  public timeLimit = input<number>(this.defaultTimeLimit);

  protected range = computed(() => [...Array(this.sideCount() || this.defaultSideCount).keys()]);

  protected playerScore = 0;
  protected computerScore = 0;


  public ngOnInit() {
    this.resetBoard();
  }

  public getCellState(x: number, y: number): GameStates | undefined {
    return this.board.get(this.getBoardCellKey(x, y));
  }

  public onCellClick(x: number, y: number): void {
    if (this.getCellState(x, y) !== GameStates.Pending) return;
    this.setCellState(x, y, GameStates.Point);
    this.playerScore++;
    this.checkGameStatus();
  }

  public startGame(): void {
    this.resetScore();
    this.resetBoard();

    this.gameSub?.unsubscribe();
    this.gameSub = this.roundStart.asObservable()
      .pipe(
        debounceTime(this.timeLimit()),
        map(() => this.activeCell),
        filter(Boolean),
        tap(({x, y}) => {
          if (this.getCellState(x, y) === GameStates.Pending) {
            this.setCellState(x, y, GameStates.Lost);
            this.computerScore++;
          }
          this.cdr.markForCheck();
          this.checkGameStatus();
        })
      )
      .subscribe();

    this.runGame();
  }

  public runGame(): void {

    const availableCells = Array.from(this.board.keys()).filter(key => this.board.get(key) === GameStates.Default);
    const nextCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    const [x, y] = this.getBoardCoordsFromKey(nextCell);
    this.setCellState(x, y, GameStates.Pending);
    this.activeCell = {x, y};
    this.roundStart.next();
  }

  checkGameStatus(): void {
    if (this.playerScore >= 10 || this.computerScore >= 10) {
      console.log('Game end');
      this.gameSub?.unsubscribe();
    } else {
      this.runGame();
    }
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
    this.playerScore = 0;
    this.computerScore = 0;
  }

  private resetBoard(): void {
    this.range().forEach((i) => {
      this.range().forEach((j) => {
        this.setCellState(i, j, GameStates.Default);
      });
    });
  }

  private setCellState(x: number, y: number, state: GameStates): void {
    this.board.set(this.getBoardCellKey(x, y), state);
  }
}
