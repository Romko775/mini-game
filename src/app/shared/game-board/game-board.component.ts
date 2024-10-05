import {Component, input, OnInit} from '@angular/core';
import {GameStates} from "../../core/enums";

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent implements OnInit {
  private readonly defaultSideCount = 10;

  protected board: GameStates[][] = [];

  public sideCount = input<number>(this.defaultSideCount);


  public ngOnInit() {
    const size = this.sideCount() || this.defaultSideCount;
    this.board = Array(size)
      .fill(null)
      .map(() => Array(size).fill(GameStates.Default));
  }

  public onCellClick(x: any, y: any): void {

  }
}
