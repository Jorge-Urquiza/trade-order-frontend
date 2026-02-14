import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from './loading.service';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  public constructor(private readonly loadingService: LoadingService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.context.get(SKIP_LOADING)) {
      return next.handle(req);
    }

    this.loadingService.start();

    return next.handle(req).pipe(finalize(() => this.loadingService.stop()));
  }
}
