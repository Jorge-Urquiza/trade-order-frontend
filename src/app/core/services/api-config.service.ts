import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  public buildUrl(path: string): string {
    const normalizedPath = path.replace(/^\/+/, '');

    if (!this.baseUrl) {
      return `/${normalizedPath}`;
    }

    return `${this.baseUrl}/${normalizedPath}`;
  }
}
