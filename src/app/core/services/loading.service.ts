import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private activeRequests = 0;

  public get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public start(): void {
    this.activeRequests += 1;

    if (this.activeRequests === 1) {
      this.loadingSubject.next(true);
    }
  }

  public stop(): void {
    this.activeRequests = Math.max(this.activeRequests - 1, 0);

    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }
}
