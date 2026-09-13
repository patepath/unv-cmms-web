import { Component, signal } from '@angular/core';
import { DefaultLayout } from './components/default-layout/default-layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('unv-cmms-web');
}
