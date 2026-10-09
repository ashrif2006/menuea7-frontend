import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { RouterLink } from '@angular/router';
import { JourneyAnimationComponent } from './components/journey-animation.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, FooterComponent , RouterLink , JourneyAnimationComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {}