import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  standalone: false,
})
export class PageHeaderComponent {
  @Input({ required: true }) public title = '';
  @Input() public subtitle = '';
}
