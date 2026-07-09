// Banco de Dados Modelo (Mock Data)
// Pronto para ser preenchido nos futuros projetos

export interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  icone?: string;
}

export interface EquipeMembro {
  id: string;
  nome: string;
  cargo: string;
  avatarUrl?: string;
  bio?: string;
}

export interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
}

export const servicosMock: Servico[] = [];
export const equipeMock: EquipeMembro[] = [];
export const faqMock: FAQItem[] = [];
