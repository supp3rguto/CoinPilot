import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public products: any[] = [];
  public simulationContext: string | null = null;
  public isLoading: boolean = true;

  public chartData: any[] = [];
  public selectedRouteId: number = 3;
  public viewAll: boolean = false;

  constructor(private socket: Socket) {
    this.initDataListener();
  }

  private initDataListener() {
    this.socket.fromEvent<any>('price-update').subscribe(data => {
      this.isLoading = false;
      this.products = data.products;
      this.simulationContext = data.context;

      if (!this.products.find(p => p.id === this.selectedRouteId) && this.products.length > 0) {
        this.selectedRouteId = this.products[0].id;
      }

      this.updateChartData(data.products);
    });
  }

  public updateChartData(products: any[]) {
    const timestamp = new Date().toLocaleTimeString();

    if (this.viewAll) {
      let newChartData = [...this.chartData];
      
      if (newChartData.length === 0 || newChartData.length !== products.length) {
         newChartData = products.map(p => {
             const existing = this.chartData.find(c => c.name === p.name);
             return existing ? existing : { name: p.name, series: [] };
         });
      }

      products.forEach(product => {
        const seriesItem = newChartData.find(s => s.name === product.name);
        if (seriesItem) {
          const newSeries = [...seriesItem.series, { name: timestamp, value: product.currentPrice }];
          if (newSeries.length > 20) newSeries.shift();
          seriesItem.series = newSeries;
        }
      });
      this.chartData = [...newChartData];

    } else {
      const product = products.find(p => p.id === this.selectedRouteId);
      if (!product) return;

      let currentSeries = [];
      if (this.chartData.length > 0 && this.chartData[0].name === product.name) {
         currentSeries = this.chartData[0].series;
      }

      const newSeries = [...currentSeries, { name: timestamp, value: product.currentPrice }];
      if (newSeries.length > 20) newSeries.shift();
      
      this.chartData = [{ name: product.name, series: newSeries }];
    }
  }
  
  public toggleViewAll(checked: boolean) {
    this.viewAll = checked;
    this.chartData = [];
    this.updateChartData(this.products);
  }

  public changeSelectedRoute(id: number) {
    this.selectedRouteId = id;
    this.chartData = [];
    this.updateChartData(this.products);
  }
}