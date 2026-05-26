export interface UsuarioLogado {
    token: string;
    refreshToken?: string;
    id: string;
    nome?: string;
    email: string;
    roles: string[];
    expiracao: Date;
}