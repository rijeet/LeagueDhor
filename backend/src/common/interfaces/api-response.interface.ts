export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  data?: T;
  error?: string;
}
