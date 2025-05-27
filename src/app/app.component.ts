import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Added RouterLink and RouterLinkActive

@Component({
  selector: 'app-root',
  standalone: true, // Added standalone: true
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Added RouterLink and RouterLinkActive to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'common-utils-ui';
}
