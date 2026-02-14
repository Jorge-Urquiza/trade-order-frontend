import { Component } from '@angular/core';
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

import Aura from '@primeuix/themes/aura';
import { PrimeNG } from 'primeng/config';

import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent {
  public readonly loading$: Observable<boolean>;

  public constructor(
    private readonly primeNg: PrimeNG,
    private readonly loadingService: LoadingService,
  ) {
    this.loading$ = this.loadingService.loading$.pipe(observeOn(asyncScheduler));

    this.primeNg.setConfig({
      ripple: true,
      theme: {
        preset: Aura,
      },
    });
  }
}
