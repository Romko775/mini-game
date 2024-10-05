import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {GameRunnerService} from "../../services/game-runner/game-runner.service";

@Component({
  selector: 'app-game-score',
  standalone: true,
  imports: [],
  templateUrl: './game-score.component.html',
  styleUrl: './game-score.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameScoreComponent {
  private gameRunnerService = inject(GameRunnerService);

  public get playerScore(): number {
    return this.gameRunnerService.playerScore;
  }

  public get computerScore(): number {
    return this.gameRunnerService.computerScore;
  }
}
