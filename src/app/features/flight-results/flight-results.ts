import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';


interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
  seatsLeft: number;
}

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports:[DecimalPipe,FormsModule],
  templateUrl: './flight-results.html',
  styleUrl: './flight-results.scss'
})
export class FlightResultsComponent {

  from = 'DEL';
  to = 'BOM';
  departureDate = '15 Oct 2026';

  selectedSort = 'recommended';

  flights: Flight[] = [
    {
      id: 'FI-20261015-6E2134',
      airline: 'IndiGo',
      flightNumber: '6E 2134',
      aircraft: 'Airbus A320neo',
      from: 'DEL',
      to: 'BOM',
      departure: '06:30',
      arrival: '08:45',
      duration: '2h 15m',
      stops: 'Non-stop',
      price: 5420,
      seatsLeft: 8
    },
    {
      id: 'FI-20261015-AI864',
      airline: 'Air India',
      flightNumber: 'AI 864',
      aircraft: 'Airbus A321',
      from: 'DEL',
      to: 'BOM',
      departure: '09:15',
      arrival: '11:30',
      duration: '2h 15m',
      stops: 'Non-stop',
      price: 6180,
      seatsLeft: 12
    },
    {
      id: 'FI-20261015-UK955',
      airline: 'Vistara',
      flightNumber: 'UK 955',
      aircraft: 'Airbus A320',
      from: 'DEL',
      to: 'BOM',
      departure: '12:40',
      arrival: '15:00',
      duration: '2h 20m',
      stops: 'Non-stop',
      price: 6750,
      seatsLeft: 5
    },
    {
      id: 'FI-20261015-6E6087',
      airline: 'IndiGo',
      flightNumber: '6E 6087',
      aircraft: 'Airbus A320',
      from: 'DEL',
      to: 'BOM',
      departure: '16:20',
      arrival: '18:40',
      duration: '2h 20m',
      stops: 'Non-stop',
      price: 4890,
      seatsLeft: 3
    },
    {
      id: 'FI-20261015-AI805',
      airline: 'Air India',
      flightNumber: 'AI 805',
      aircraft: 'Airbus A320neo',
      from: 'DEL',
      to: 'BOM',
      departure: '20:10',
      arrival: '22:25',
      duration: '2h 15m',
      stops: 'Non-stop',
      price: 7240,
      seatsLeft: 18
    }
  ];

  constructor(private router: Router) {}

  get sortedFlights(): Flight[] {

    const result = [...this.flights];

    if (this.selectedSort === 'price') {
      return result.sort((a, b) => a.price - b.price);
    }

    if (this.selectedSort === 'duration') {
      return result.sort((a, b) =>
        this.durationToMinutes(a.duration) -
        this.durationToMinutes(b.duration)
      );
    }

    return result;
  }

  selectFlight(flight: Flight): void {

    this.router.navigate(['/passengers'], {
      state: {
        flight
      }
    });
  }

  changeSearch(): void {
    this.router.navigate(['/']);
  }

  private durationToMinutes(duration: string): number {
    const hours = Number(duration.split('h')[0]);
    const minutes = Number(duration.split('h')[1]?.replace('m', '') || 0);

    return hours * 60 + minutes;
  }
}