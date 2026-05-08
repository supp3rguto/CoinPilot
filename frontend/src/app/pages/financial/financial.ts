import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';

interface FinanceData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalTransactions: number;
  avgProfitPerTransaction: number;
  profitByRoute: any[];
  latestTransactions: any[];
}

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    NgxChartsModule
  ],
  templateUrl: './financial.html',
  styleUrls: ['./financial.css']
})
export class FinancialComponent implements OnInit, OnDestroy {

  public financeData: FinanceData | null = null;
  public isLoading = true;
  
  public displayedColumns: string[] = ['id', 'routeName', 'cost', 'revenue', 'profit'];
  
  private financeSub: Subscription | undefined;

  constructor(private socket: Socket) { }

  ngOnInit() {
    this.financeSub = this.socket.fromEvent<FinanceData>('finance-update')
      .subscribe(data => {
        data.profitByRoute = [...data.profitByRoute];
        
        this.financeData = data;
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    if (this.financeSub) {
      this.financeSub.unsubscribe();
    }
  }

  formatProfit(value: number): string {
    return `R$${value.toFixed(2)}`;
  }
}