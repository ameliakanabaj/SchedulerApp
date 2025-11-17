import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Calendar } from "@app/shared/components";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  imports: [Calendar, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
    today = new Date();

    workdays = [];

    upcomingShifts = [
        { date: new Date(), start: '08:00', end: '16:00' },
        { date: new Date(Date.now() + 86400000), start: '12:00', end: '20:00' }
    ];

    notifications = [
        { message: 'Zmieniono Twoją zmianę na 23.11', date: new Date() },
        { message: 'Nowy komunikat od managera', date: new Date() }
    ]; // temp

    // ng on init z pobraniem schedules i wtedy upcoming shifts dodanie
}
