import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { MessageService } from 'primeng/api';

import { HttpErrorInterceptor } from './services/http-error.interceptor';
import { HttpLoadingInterceptor } from './services/http-loading.interceptor';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoadingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  public constructor(@Optional() @SkipSelf() parentModule: CoreModule | null) {
    if (parentModule) {
      throw new Error('CoreModule should be imported only in AppModule.');
    }
  }
}
