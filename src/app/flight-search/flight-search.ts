import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.html',
  styleUrl: './flight-search.scss'
})
export class FlightSearchComponent {

  from = 'DEL';
  to = 'BOM';

  departureDate = '15 Oct 2026';
  returnDate = '20 Oct 2026';

  adults = 1;
  children = 0;
  infants = 0;

  showPassengers = false;

  constructor(private router: Router) {}

  get totalPassengers(): number {
    return this.adults + this.children + this.infants;
  }

  swapLocations(): void {
    [this.from, this.to] = [this.to, this.from];
  }

  increase(type: 'adults' | 'children' | 'infants'): void {

    if (type === 'adults') {
      this.adults++;
    }

    if (type === 'children') {
      this.children++;
    }

    if (type === 'infants') {
      this.infants++;
    }
  }

  decrease(type: 'adults' | 'children' | 'infants'): void {

    if (type === 'adults' && this.adults > 1) {
      this.adults--;
    }

    if (type === 'children' && this.children > 0) {
      this.children--;
    }

    if (type === 'infants' && this.infants > 0) {
      this.infants--;
    }
  }

  searchFlights(): void {

    this.router.navigate(['/flights'], {
      state: {
        search: {
          from: this.from,
          to: this.to,
          departureDate: this.departureDate,
          returnDate: this.returnDate,
          adults: this.adults,
          children: this.children,
          infants: this.infants
        }
      }
    });

  }
}