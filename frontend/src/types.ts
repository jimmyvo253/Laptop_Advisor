export interface Laptop {
  id?: number;
  name: string;
  performance: number;
  resolution: number;
  capacity: number;
  portability: number;
  battery: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface LaptopCreate {
  name: string;
  performance: number;
  resolution: number;
  capacity: number;
  portability: number;
  battery: number;
  price: number;
}

export interface LaptopUpdate extends Partial<LaptopCreate> {}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface RankingResult {
  name: string;
  score: number;
}

export interface RankingResponse {
  weights: Record<string, number>;
  cr: number;
  ranking: RankingResult[];
}
