export interface FetchAlert {
  id: number;
  farmId: number;
  title: string;
  message: string;
  date: string;
  status: AlertStatus;
}
export interface CreateAlert {
  farmId: number;
  title: string;
  message: string;
  date: string;
   status: AlertStatus;
}

export type AlertStatus = "active"| "resolved";