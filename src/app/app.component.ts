import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GameBoardComponent} from "./shared/game-board/game-board.component";
import {GameScoreComponent} from "./shared/game-score/game-score.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {GameRunnerService} from "./services/game-runner/game-runner.service";
import {validNumberValidator} from "./core/validators";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameBoardComponent, GameScoreComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mini-game';

  private gameRunnerService = inject(GameRunnerService);

  timeLimit = new FormControl<number>(this.gameRunnerService.defaultTimeLimit, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), validNumberValidator]
  });

  public startGame(): void {
    this.gameRunnerService.startGame({
      timeLimit: this.timeLimit.value
    });
  }
}
