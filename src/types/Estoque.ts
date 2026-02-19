export interface ItemEstoque {
  id?: string; // O ID vem do Firebase, por isso é opcional no cadastro
  nome: string;
  quantidade: number;
  categoria: "Cesta Básica" | "Suplemento" | "Higiene" | "Outros"; // Tipagem estrita
  dataValidade: string; //(YYYY/MM/DD)
  dataCriacao?: any; // Timestamp do Firebase
}
