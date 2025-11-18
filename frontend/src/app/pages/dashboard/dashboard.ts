import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatTableModule, MatProgressSpinnerModule,
    NgxChartsModule, MatSelectModule, MatSlideToggleModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit { 
  
  public displayedColumns: string[] = ['name', 'basePrice', 'currentPrice'];

  constructor(public state: StateService) {}

  ngOnInit() {
  }

  onViewAllToggle(event: any) {
    this.state.toggleViewAll(event.checked);
  }

  onSelectionChange(event: any) {
    this.state.changeSelectedRoute(event.value);
  }

  getCardColor(index: number) {
    const colors = ['#29b6f6', '#66bb6a', '#ffa726', '#e57373'];
    return colors[index % colors.length];
  }
}