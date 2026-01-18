import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [NgClass],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
    @Input() text = 'Loading...';
    @Input() size: 'small' | 'medium' | 'large' = 'medium'
    @Input() fullscreen = false;
}
