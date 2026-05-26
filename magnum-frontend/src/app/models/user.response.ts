export interface User {
    email: string;
    expiracao: string; // ← Não pode ser null!
    id: string;
    nome: string;
    roles: string[];
    token: string;
    refreshToken: string;
}