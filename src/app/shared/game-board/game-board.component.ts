import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
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
export class GameBoardComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  private gameRunnerService = inject(GameRunnerService);
  private readonly _redrawEvents = [GameEvents.BoardUpdated];

  public ngOnInit() {
    this.gameRunnerService.initBoard();
    this.gameRunnerService.gameEvents
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(e => this._redrawEvents.includes(e)),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();
  }

  public get range(): number[] {
    return this.gameRunnerService.range;
  }

  public getCellState(x: number, y: number): GameStates | null | undefined {
    return this.gameRunnerService.getCellState(x, y);
  }

  public onCellClick(x: number, y: number): void {
    this.gameRunnerService.onCellClick(x, y);
  }

}
