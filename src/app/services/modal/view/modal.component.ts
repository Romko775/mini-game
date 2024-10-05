import {Component, input, output} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  msg = input<string>();
  closeModal = output<void>();

  close() {
    this.closeModal.emit();
  }
}
