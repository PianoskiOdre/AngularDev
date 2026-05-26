export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    refreshToken: string;
    userNametag: string;
    email: string;
    userId: string;
    expiration: string; // ← Importante!
    roles: string[];
}