export interface Pen {
  id: number;
  barnId: number;
  name: string;
  capacity: number | null;
}

export interface PenCreatePayload {
  barnId: number;
  name: string;
  capacity?: number | null;
}