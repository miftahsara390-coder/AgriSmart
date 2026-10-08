export interface DiagnosisDetails {
  plant?: string;
  problem?: string;
  confidence?: string | number;
  recommendations?: string;
  symptoms?: string[];
  advice?: string;
  treatment?: string;
}

export interface ScanItem {
  id: string | number;
  plant?: string;
  disease?: string;
  confidence?: number | string;
  symptoms?: string[];
  advice?: string;
  treatment?: string;
  imageUrl?: string;
  createdAt?: string;
  cropId?: string | number;
}

export interface ScanResponse {
  success: boolean;
  scan: ScanItem;
  diagnosis: DiagnosisDetails;
  disclaimer: string;
}

export interface ScanHistoryResponse {
  scans: ScanItem[];
}
