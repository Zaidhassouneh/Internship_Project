export interface RegisterDto {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    createdAt: string;
    lastLoginAt?: string;
  };
  expiresAt: string;
}
