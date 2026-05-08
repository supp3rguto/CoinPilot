import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface AppSettings {
  salesSimulation: boolean;
  weatherSimulation: boolean;
  eventSimulation: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  public settings: AppSettings | null = null;
  public isLoading = true;
  private settingsSub: Subscription | undefined;

  constructor(private socket: Socket) { }

  ngOnInit() {
    this.settingsSub = this.socket.fromEvent<AppSettings>('settings-changed')
      .subscribe(data => {
        this.settings = data;
        this.isLoading = false;
      });

      this.socket.emit('get-settings'); 
  }

  ngOnDestroy() {
    if (this.settingsSub) {
      this.settingsSub.unsubscribe();
    }
  }

  onSettingChange(key: string, value: boolean) {
    if (!this.settings) return;

    (this.settings as any)[key] = value;
    
    this.socket.emit('update-setting', { key: key, value: value });
  }
}