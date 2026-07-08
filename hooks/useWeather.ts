import { useState, useCallback } from 'react';

export interface WeatherInfo {
  temp: number;
  unit: 'F' | 'C';
  condition: 'clear' | 'cloudy' | 'rain' | 'cold';
  icon: 'wbSunny' | 'umbrella' | 'cloud';
}

const mockConditions: WeatherInfo[] = [
  { temp: 72, unit: 'F', condition: 'clear', icon: 'wbSunny' },
  { temp: 68, unit: 'F', condition: 'cloudy', icon: 'cloud' },
  { temp: 55, unit: 'F', condition: 'cold', icon: 'umbrella' },
  { temp: 75, unit: 'F', condition: 'clear', icon: 'wbSunny' },
];

export function useWeather() {
  const [weather, setWeather] = useState<WeatherInfo>(mockConditions[0]);

  const refresh = useCallback(() => {
    const idx = Math.floor(Math.random() * mockConditions.length);
    setWeather(mockConditions[idx]);
  }, []);

  return { weather, refresh };
}
