import {ApplicationRef, ComponentFactoryResolver, ComponentRef, inject, Injectable, Injector} from '@angular/core';
import {ModalComponent} from './view/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private componentRef!: ComponentRef<ModalComponent>;
  private isOpen = false;

  private appRef = inject(ApplicationRef);
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private injector = inject(Injector);

  /**
   * @desc Open modal instance with message.
   */
  open(msg?: string) {
    if (this.isOpen) return;

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    this.componentRef = componentFactory.create(this.injector);

    if (msg) this.componentRef.setInput('msg', msg);

    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.isOpen = true;

    this.componentRef.instance.closeModal
      .subscribe(() => {
        this.close();
      });
  }

  /**
   * @desc Closes modal instance.
   */
  close() {
    if (!this.isOpen) return;
    this.appRef.detachView(this.componentRef.hostView);
    this.componentRef.destroy();
    this.isOpen = false;
  }
}
