export interface Crop {
  id: string | number;
  name: string;
  type?: string;
  variety?: string;
  location?: string;
  stage?: string;
  status?: string;
  plantingDate?: string;
  harvestDate?: string;
  notes?: string;
  imageUrl?: string;
  userId?: string | number;
  createdAt?: string;
  updatedAt?: string;
  // UI & agricultural helper fields
  area?: number | string;
  plotArea?: string;
  row?: string;
  field?: string;
  expectedHarvestDate?: string;
  isTuber?: boolean;
  actionText?: string;
  actionIcon?: string;
  actionColor?: string;
  icon?: string;
  image?: string;
}

export interface CropDetailProgression {
  stage: string;
  percent: number;
  stages: string[];
}

export interface CropObservation {
  id: string | number;
  cropId: string | number;
  note: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SensorRecord {
  id: string | number;
  cropId?: string | number;
  soilMoisture?: number;
  soilTemperature?: number;
  ambientTemperature?: number;
  humidity?: number;
  sunlight?: number;
  recordedAt?: string;
  createdAt?: string;
}

export interface CropDetailResponse {
  crop: Crop;
  progression: CropDetailProgression;
  nextTask?: any;
  observations: CropObservation[];
  sensorHistory: SensorRecord[];
}

export interface CropTelemetryResponse {
  cropCount: number;
  healthyCrops: number;
  attentionCrops: number;
  avgSoilMoisture: number | null;
  latestSensor: SensorRecord | null;
}

export interface CropIntelligenceResponse {
  crop: Crop;
  stageInfo?: any;
  weatherRisk?: any;
  pestRisk?: any;
  aiRecommendations?: string[];
  nextAction?: any;
  [key: string]: any;
}

export interface AiAdviceResponse {
  advice: string;
  [key: string]: any;
}

export interface CreateCropInput {
  name: string;
  type?: string;
  variety?: string;
  location?: string;
  stage?: string;
  status?: string;
  plantingDate?: string;
  harvestDate?: string;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateCropInput extends Partial<CreateCropInput> {}

export interface AddObservationInput {
  note: string;
  imageUrl?: string;
}
