import { Pipe, PipeTransform } from '@angular/core';
import { FoodItem } from '../Models/FoodItem';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: FoodItem[], searchTerm: string): FoodItem[] {
    if (!items || !searchTerm) {
      return items;
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
