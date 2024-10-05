import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit} from '@angular/core';
import {GameStates} from "../../core/enums";
import {debounceTime, filter, interval, map, Subject, Subscription, take, tap} from "rxjs";

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

  private cdr = inject(ChangeDetectorRef);

  private activeCell: { row: number, col: number } | null = null;
  private roundStart = new Subject<void>();
  private gameSub: Subscription | null = null;

  protected board: GameStates[][] = [];

  public sideCount = input<number>(this.defaultSideCount);


  playerScore: number = 0;
  computerScore: number = 0;
  timeLimit: number = 3000;

  public ngOnInit() {
    this.resetBoard();
  }

  public onCellClick(row: number, col: number): void {
    if (this.board[row][col] !== GameStates.Pending) return;
    this.board[row][col] = GameStates.Point;
    this.playerScore++;
    this.checkGameStatus();
  }

  public startGame(): void {
    this.resetScore();
    this.resetBoard();

    this.gameSub?.unsubscribe();
    this.gameSub = this.roundStart.asObservable()
      .pipe(
        debounceTime(this.timeLimit),
        map(() => this.activeCell),
        filter(Boolean),
        tap(({row, col}) => {
          if (this.board[row][col] === GameStates.Pending) {
            this.board[row][col] = GameStates.Lost;
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
    const randomRow = Math.floor(Math.random() * 10);
    const randomCol = Math.floor(Math.random() * 10);

    // Перевірка, чи комірка вже була натиснута, якщо так, шукаємо іншу
    if (this.board[randomRow][randomCol] !== GameStates.Default) {
      this.runGame();
      return;
    }

    this.board[randomRow][randomCol] = GameStates.Pending;
    this.activeCell = {row: randomRow, col: randomCol};
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

  private resetScore(): void {
    this.playerScore = 0;
    this.computerScore = 0;
  }

  private resetBoard(): void {
    const size = this.sideCount() || this.defaultSideCount;
    this.board = Array(size)
      .fill(null)
      .map(() => Array(size).fill(GameStates.Default));
  }
}
