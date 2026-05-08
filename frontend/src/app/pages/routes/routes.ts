import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './routes.html',
  styleUrls: ['./routes.css']
})
export class RoutesComponent implements OnInit {

  private API_URL = 'http://localhost:3000';
  
  public routes: any[] = [];
  public isLoading = true;
  public displayedColumns: string[] = ['id', 'name', 'basePrice', 'actions'];
  
  public routeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.routeForm = this.fb.group({
      origem: ['', Validators.required],
      destino: ['', Validators.required],
      basePrice: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.API_URL}/products`).subscribe({
      next: (data) => {
        this.routes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erro ao carregar rotas!", err);
        this.isLoading = false;
      }
    });
  }

  addRoute() {
    if (this.routeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { origem, destino, basePrice } = this.routeForm.value;

    const newRouteData = {
      name: `${origem} -> ${destino}`,
      basePrice: basePrice
    };

    this.http.post(`${this.API_URL}/routes`, newRouteData).subscribe({
      next: () => {
        this.routeForm.reset();
        this.loadRoutes();
      },
      error: (err) => {
        console.error("Erro ao adicionar rota!", err);
        this.isLoading = false;
      }
    });
  }

  deleteRoute(routeId: number) {
    this.isLoading = true;
    this.http.delete(`${this.API_URL}/routes/${routeId}`).subscribe({
      next: () => {
        this.loadRoutes();
      },
      error: (err) => {
        console.error("Erro ao deletar rota!", err);
        this.isLoading = false;
      }
    });
  }
}