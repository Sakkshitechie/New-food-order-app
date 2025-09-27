import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports:[RouterOutlet,Header,Footer,Navbar],
  templateUrl: './app.html'
})
export class App {
}
