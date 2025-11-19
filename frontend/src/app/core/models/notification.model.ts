export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO 8601 string representation of Instant
}
