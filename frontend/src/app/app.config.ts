import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { RoutesComponent } from './pages/routes/routes';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


const config: SocketIoConfig = { 
  url: 'http://localhost:3000', options: {} 
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'routes', component: RoutesComponent }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    provideAnimationsAsync(), 
    importProvidersFrom(ReactiveFormsModule), 
    importProvidersFrom(SocketIoModule.forRoot(config)),
    importProvidersFrom(MatSidenavModule),
    importProvidersFrom(MatIconModule),
    importProvidersFrom(MatListModule),
    importProvidersFrom(MatFormFieldModule),
    importProvidersFrom(MatInputModule),
    importProvidersFrom(MatButtonModule)
  ]
};