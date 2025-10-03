import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { MenuCards } from './pages/menu-cards/menu-cards';
import { Order } from './pages/order/order';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'search/:searchTerm', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile },
  { path: 'menu', component: MenuCards },
  { path: 'order', component: Order, canActivate: [AuthGuard] },
  { path: 'order/:orderId', component: Order, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];


