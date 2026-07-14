/**
 * PromptTemplate
 *
 * Provê recursos de interpolação e preenchimento de variáveis de template de forma segura e determinística.
 */

export class PromptTemplate {
  private readonly templateText: string;

  constructor(templateText: string) {
    this.templateText = templateText;
  }

  /**
   * Substitui chaves formatadas como `{variavel}` pelos valores correspondentes.
   */
  render(vars: Record<string, string>): string {
    let result = this.templateText;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }
}
