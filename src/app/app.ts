import { Component, signal,inject,OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('261dswS4AngularSigconFrontend');
  loadingService = inject(LoadingService)

  ngOnInit(): void {

  }


}
