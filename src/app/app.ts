import { Component, signal } from '@angular/core';
import { SilkComponent } from './silk';
import { MainHeader } from './components/main-header/main-header';
import {TextTypeComponent} from './text-type/text-type.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SilkComponent, MainHeader, TextTypeComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('justproj');
}
