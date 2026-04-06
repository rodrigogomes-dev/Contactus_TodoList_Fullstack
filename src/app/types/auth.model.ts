export interface AuthUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    avatar_path?: string | null;
    avatar_url?: string | null;
    is_admin: number;
    created_at: string;
    updated_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}
