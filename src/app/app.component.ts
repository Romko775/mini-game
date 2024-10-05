import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GameBoardComponent} from "./shared/game-board/game-board.component";
import {GameScoreComponent} from "./shared/game-score/game-score.component";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {GameRunnerService} from "./services/game-runner/game-runner.service";
import {validNumberValidator} from "./core/validators";
import {filter, tap} from "rxjs";
import {GameEvents} from "./core/enums";
import {ModalService} from "./services/modal/modal.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameBoardComponent, GameScoreComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private modal = inject(ModalService);
  private gameRunnerService = inject(GameRunnerService);

  timeLimit = new FormControl<number>(this.gameRunnerService.defaultTimeLimit, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), validNumberValidator]
  });

  public ngOnInit() {
    this.gameRunnerService.gameEvents
      .pipe(
        filter(e => e === GameEvents.GameEnded),
        tap(() => this.handleWinnerMessage())
      )
      .subscribe()
  }

  public startGame(): void {
    this.gameRunnerService.startGame({
      timeLimit: this.timeLimit.value
    });
  }

  private handleWinnerMessage(): void {
    const msg = this.gameRunnerService.playerScore() >= 10
      ? 'Player won'
      : 'Computer won';
    this.modal.open(msg);
  }
}
