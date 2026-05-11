/** Shape returned by every 4xx / 5xx response from the backend */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
