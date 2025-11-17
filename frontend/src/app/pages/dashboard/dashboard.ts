import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
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
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit { 
  
  private API_URL = 'http://localhost:3000';

  public products: any[] = [];
  public simulationContext: string | null = null;
  public isLoading: boolean = true;
  public displayedColumns: string[] = ['name', 'basePrice', 'currentPrice'];
  public chartData: any[] = [];
  public selectedRouteId: number = 3;
  public viewAll: boolean = false;

  constructor(private http: HttpClient, private socket: Socket) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.API_URL}/products`)
      .subscribe(data => {
        this.products = data; 
        this.isLoading = false; 
        if (!this.products.find(p => p.id === this.selectedRouteId) && this.products.length > 0) {
          this.selectedRouteId = this.products[0].id;
        }
        this.updateChartData(data);
      });

    this.socket.fromEvent<any>('price-update')
      .subscribe(data => {
        this.isLoading = false;
        this.products = data.products; 
        this.simulationContext = data.context; 
        this.updateChartData(data.products);
      });
  }

  updateChartData(products: any[]) {
    const timestamp = new Date().toLocaleTimeString();

    if (this.viewAll) {
      let newChartData = [...this.chartData];
      
      if (newChartData.length === 0) {
        newChartData = products.map(p => ({ name: p.name, series: [] }));
      }

      products.forEach(product => {
        const series = newChartData.find(s => s.name === product.name);
        if (series) {
          const newSeries = [...series.series, { name: timestamp, value: product.currentPrice }];
          if (newSeries.length > 10) newSeries.shift();
          series.series = newSeries;
        }
      });
      this.chartData = [...newChartData];

    } else {
      const product = products.find(p => p.id === this.selectedRouteId);
      if (!product) return;

      let currentSeries = (this.chartData[0]?.name === product.name) ? this.chartData[0].series : [];

      const newSeries = [...currentSeries, { name: timestamp, value: product.currentPrice }];
      if (newSeries.length > 10) newSeries.shift();
      
      this.chartData = [{ name: product.name, series: newSeries }];
    }
  }

  onViewAllToggle(event: any) {
    this.viewAll = event.checked;
    this.chartData = [];
    this.updateChartData(this.products);
  }

  onSelectionChange(event: any) {
    this.selectedRouteId = event.value;
    this.chartData = [];
    this.updateChartData(this.products);
  }

  getCardColor(index: number) {
    const colors = ['#29b6f6', '#66bb6a', '#ffa726', '#e57373']; // Adicionei mais uma cor
    return colors[index % colors.length];
  }
}