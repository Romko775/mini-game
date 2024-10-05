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
  protected gameRunnerService = inject(GameRunnerService);
}
