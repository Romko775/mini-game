import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, effect, inject, input} from '@angular/core';
import {GameRunnerService} from "../../services/game-runner/game-runner.service";
import {GameEvents, GameStates} from "../../core/enums";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter, tap} from "rxjs";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameBoardComponent {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private gameRunnerService = inject(GameRunnerService);

  public sideCount = input<number>(this.gameRunnerService.defaultSideCount);
  public timeLimit = input<number>(this.gameRunnerService.defaultTimeLimit);

  private readonly _redrawEvents = [GameEvents.BoardUpdated];

  constructor() {
    effect(() => {
      this.gameRunnerService.initBoard({
        sideCount: this.sideCount(),
        timeLimit: this.timeLimit()
      });
    });

    this.gameRunnerService.gameEvents
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(e => this._redrawEvents.includes(e)),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();
  }

  public get playerScore(): number {
    return this.gameRunnerService.playerScore;
  }

  public get computerScore(): number {
    return this.gameRunnerService.computerScore;
  }

  public get range(): number[] {
    return this.gameRunnerService.range;
  }

  public getCellState(x: number, y: number): GameStates | null | undefined {
    return this.gameRunnerService.getCellState(x, y);
  }

  public startGame(): void {
    this.gameRunnerService.startGame();
  }

  public onCellClick(x: number, y: number): void {
    this.gameRunnerService.onCellClick(x, y);
  }

}
