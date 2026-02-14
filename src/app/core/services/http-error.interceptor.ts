import { Injectable } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MessageService } from 'primeng/api';

export const SKIP_GLOBAL_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  public constructor(private readonly messageService: MessageService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!req.context.get(SKIP_GLOBAL_ERROR_TOAST)) {
          this.handleError(error);
        }

        return throwError(() => error);
      }),
    );
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      return;
    }

    let detail = 'Unexpected error while processing your request.';

    if (error.status === 0) {
      detail = 'Cannot reach server. Check backend status and network.';
    } else if (error.status === 404) {
      detail = 'Requested resource was not found.';
    } else if (error.status >= 500) {
      detail = 'Server error. Please try again in a moment.';
    } else if (typeof error.error === 'string') {
      detail = error.error;
    } else if (error.error && typeof error.error === 'object') {
      const candidate = error.error['message'];

      if (Array.isArray(candidate) && candidate.length > 0) {
        detail = String(candidate[0]);
      } else if (typeof candidate === 'string' && candidate.trim()) {
        detail = candidate;
      }
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Request failed',
      detail,
    });
  }
}
