import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>Welcome to OpenEdu</h1>
      <p>Your educational platform is ready!</p>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #333;
    }
    
    p {
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export class HomeComponent {
}
