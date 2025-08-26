export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
    MANAGER = "MANAGER"
}
export declare enum UserModule {
    CONTAS_PAGAR = "CONTAS_PAGAR",
    RELATORIO_CONTAS_PAGAR = "RELATORIO_CONTAS_PAGAR",
    ESTOQUE = "ESTOQUE",
    MOVIMENTACOES = "MOVIMENTACOES",
    RELATORIOS = "RELATORIOS",
    FORNECEDORES = "FORNECEDORES",
    CATEGORIAS = "CATEGORIAS",
    DASHBOARD = "DASHBOARD",
    CONTATOS = "CONTATOS",
    USUARIOS = "USUARIOS",
    DESPESAS_VIAGEM = "DESPESAS_VIAGEM"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    modules?: UserModule[];
}
