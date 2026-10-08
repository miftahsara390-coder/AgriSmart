export interface ForecastItem {
  day: string;
  temp: number;
  tempMin?: number;
  tempMax?: number;
  condition: string;
  icon?: string;
  rainProb?: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike?: number;
  condition: string;
  conditionMain?: string;
  humidity: number;
  windSpeed?: number;
  soilMoisture?: number;
  icon?: string;
  forecast?: ForecastItem[];
  source?: string;
}

export interface WeatherResponse {
  weather: WeatherData;
}
