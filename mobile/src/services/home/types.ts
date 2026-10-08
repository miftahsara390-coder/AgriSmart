import { Crop } from '../crops/types';
import { Task } from '../tasks/types';
import { WeatherData } from '../weather/types';

export interface HomeDashboardResponse {
  user?: any;
  weather?: WeatherData | null;
  todayTasks: Task[];
  crops: Crop[];
}
