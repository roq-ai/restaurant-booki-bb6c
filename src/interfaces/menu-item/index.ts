import { RestaurantInterface } from 'interfaces/restaurant';
import { GetQueryInterface } from 'interfaces';

export interface MenuItemInterface {
  id?: string;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  allergens?: string;
  restaurant_id?: string;
  created_at?: any;
  updated_at?: any;

  restaurant?: RestaurantInterface;
  _count?: {};
}

export interface MenuItemGetQueryInterface extends GetQueryInterface {
  id?: string;
  name?: string;
  description?: string;
  ingredients?: string;
  allergens?: string;
  restaurant_id?: string;
}
