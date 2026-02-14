import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, Optional, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { CreateTradeOrderDto } from '../../models/trade-order.dto';
import { TradeOrderType, TradePair, TradeSide } from '../../models/trade-order.model';
import { TradeOrdersService } from '../../services/trade-orders.service';

type SelectOption<T> = { label: string; value: T };

@Component({
  selector: 'app-trades-new',
  templateUrl: './trades-new.component.html',
  styleUrl: './trades-new.component.scss',
  standalone: false,
})
export class TradesNewComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);

  public readonly pairOptions: SelectOption<TradePair>[] = [
    { label: 'BTCUSD', value: 'BTCUSD' },
    { label: 'EURUSD', value: 'EURUSD' },
    { label: 'ETHUSD', value: 'ETHUSD' },
  ];

  public readonly sideOptions: SelectOption<TradeSide>[] = [
    { label: 'BUY', value: 'buy' },
    { label: 'SELL', value: 'sell' },
  ];

  public readonly typeOptions: SelectOption<TradeOrderType>[] = [
    { label: 'LIMIT', value: 'limit' },
    { label: 'MARKET', value: 'market' },
    { label: 'STOP', value: 'stop' },
  ];

  public readonly form = this.formBuilder.group({
    pair: this.formBuilder.control<TradePair | null>('BTCUSD', [Validators.required]),
    side: this.formBuilder.control<TradeSide | null>('buy', [Validators.required]),
    type: this.formBuilder.control<TradeOrderType | null>('limit', [Validators.required]),
    amount: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      maxDecimalPlacesValidator(2),
    ]),
    price: this.formBuilder.control<number | null>(null),
  });

  public submitting = false;

  private readonly destroy$ = new Subject<void>();

  public constructor(
    private readonly tradeOrdersService: TradeOrdersService,
    private readonly messageService: MessageService,
    @Optional() private readonly dialogRef: DynamicDialogRef | null,
  ) {
    this.syncPriceControlState(this.typeControl.value);
    this.typeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => {
      this.syncPriceControlState(type);
    });
  }

  public get showPrice(): boolean {
    return this.typeControl.value === 'limit' || this.typeControl.value === 'stop';
  }

  public get typeControl(): FormControl<TradeOrderType | null> {
    return this.form.controls.type;
  }

  public get priceControl(): FormControl<number | null> {
    return this.form.controls.price;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.submitting = true;

    this.tradeOrdersService
      .createTradeOrder(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Trade created',
            detail: 'Trade order was created successfully.',
          });

          this.dialogRef?.close({ created: true });
        },
        error: (error: HttpErrorResponse) => this.handleCreateError(error),
      });
  }

  public cancel(): void {
    this.dialogRef?.close({ created: false });
  }

  public isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  public controlError(controlName: string): string {
    const control = this.form.get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['min']) {
      const min = control.errors['min']['min'];
      return `Minimum allowed value is ${min}.`;
    }

    if (control.errors['maxDecimals']) {
      return `Maximum ${control.errors['maxDecimals']['required']} decimal places are allowed.`;
    }

    if (control.errors['backend']) {
      return String(control.errors['backend']);
    }

    return 'Invalid value.';
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncPriceControlState(type: TradeOrderType | null): void {
    if (type === 'market') {
      this.priceControl.setValue(null, { emitEvent: false });
      this.priceControl.clearValidators();
      this.priceControl.disable({ emitEvent: false });
      this.priceControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    this.priceControl.enable({ emitEvent: false });
    this.priceControl.setValidators([
      Validators.min(0.00001),
      maxDecimalPlacesValidator(5),
    ]);
    this.priceControl.updateValueAndValidity({ emitEvent: false });
  }

  private buildPayload(): CreateTradeOrderDto {
    const raw = this.form.getRawValue();
    const isMarketOrder = raw.type === 'market';

    return {
      pair: raw.pair as TradePair,
      side: raw.side as TradeSide,
      type: raw.type as TradeOrderType,
      amount: Number(raw.amount),
      price: isMarketOrder ? null : Number(raw.price),
    };
  }

  private handleCreateError(error: HttpErrorResponse): void {
    const messages = this.extractMessages(error);

    if (error.status === 400) {
      this.applyBackendFieldErrors(error.error);
    }

    if (messages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Could not create trade',
        detail: 'Unexpected error while creating trade order.',
      });
      return;
    }

    messages.forEach(message => {
      this.messageService.add({
        severity: 'error',
        summary: 'Could not create trade',
        detail: message,
      });
    });
  }

  private extractMessages(error: HttpErrorResponse): string[] {
    const messages: string[] = [];
    const body = error.error;

    if (typeof body === 'string' && body.trim().length > 0) {
      messages.push(body);
      return messages;
    }

    if (body && typeof body === 'object') {
      if (Array.isArray(body['message'])) {
        body['message'].forEach((item: unknown) => {
          if (typeof item === 'string') {
            messages.push(item);
          }
        });
      } else if (typeof body['message'] === 'string') {
        messages.push(body['message']);
      }

      const errors = body['errors'];
      if (errors && typeof errors === 'object') {
        Object.values(errors).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(entry => {
              if (typeof entry === 'string') {
                messages.push(entry);
              }
            });
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
      }
    }

    return Array.from(new Set(messages));
  }

  private applyBackendFieldErrors(errorBody: unknown): void {
    if (!errorBody || typeof errorBody !== 'object' || !('errors' in errorBody)) {
      return;
    }

    const errors = (errorBody as { errors?: Record<string, unknown> }).errors;
    if (!errors || typeof errors !== 'object') {
      return;
    }

    Object.entries(errors).forEach(([field, value]) => {
      const control = this.form.get(field);
      if (!control) {
        return;
      }

      const message = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
      control.setErrors({
        ...(control.errors ?? {}),
        backend: message,
      });
      control.markAsTouched();
    });
  }
}

function maxDecimalPlacesValidator(maxDecimals: number): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined) {
      return null;
    }

    const decimalPlaces = String(value).split('.')[1]?.length ?? 0;
    if (decimalPlaces > maxDecimals) {
      return { maxDecimals: { required: maxDecimals, actual: decimalPlaces } };
    }

    return null;
  };
}
