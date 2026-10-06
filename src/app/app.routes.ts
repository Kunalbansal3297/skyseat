import { Routes } from '@angular/router';
import { AircraftComponent } from './aircraft/aircraft';
import { FlightSearchComponent } from './flight-search/flight-search';


export const routes: Routes = [
     {path:'',component:FlightSearchComponent},
    {path:'aircraft',component:AircraftComponent},
    {
  path: 'flights',
  loadComponent: () =>
    import('./features/flight-results/flight-results')
      .then(m => m.FlightResultsComponent)
}
];
