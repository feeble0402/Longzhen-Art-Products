export interface AdminTokenPayload {
  sub: string;
  email: string;
  displayName: string;
  passwordVersion: number;
}
