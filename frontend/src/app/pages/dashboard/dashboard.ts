import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
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
    NgxChartsModule
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

  public rideChartData: any[] = [
    { name: 'Viagem Aeroporto -> Hotel', series: [] }
  ];

  constructor(private http: HttpClient, private socket: Socket) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.API_URL}/products`)
      .subscribe(data => {
        this.products = data; 
        this.isLoading = false; 
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
    const productToPlot = products.find(p => p.id === 3);
    if (!productToPlot || productToPlot.currentPrice === 0) return;

    const timestamp = new Date().toLocaleTimeString();
    const newPrice = productToPlot.currentPrice;

    const newPoint = { name: timestamp, value: newPrice };
    const currentSeries = this.rideChartData[0].series;
    const updatedSeries = [...currentSeries, newPoint];

    if (updatedSeries.length > 10) {
      updatedSeries.shift();
    }
    
    this.rideChartData = [
      { ...this.rideChartData[0], series: updatedSeries }
    ];
  }

  getCardColor(index: number) {
    const colors = ['#29b6f6', '#66bb6a', '#ffa726'];
    return colors[index % colors.length];
  }
}