import { z } from 'zod';

// Schema para o step3 - Filtros Avançados
export const advancedFilterSchema = z
  .object({
    // Campos dinâmicos serão validados via .passthrough(), mas você pode adicionar validações específicas aqui
    nom_grupo_marca: z.string().min(1, 'Marca é obrigatória').optional(),
    atl_niveldeensino__c: z.array(z.string()).optional(),
    modalidade: z.array(z.string()).optional(),
    nom_curso: z.array(z.string()).optional(),
    nom_curso_exclude: z.array(z.string()).optional(),
    etapa_funil: z.array(z.string()).optional(),
    status_vestibular: z.array(z.string()).optional(),
    faixa_etaria: z
      .object({
        min: z
          .number()
          .min(0, 'Idade mínima deve ser maior que 0')
          .max(100, 'Idade mínima não pode ser maior que 100'),
        max: z
          .number()
          .min(0, 'Idade máxima deve ser maior que 0')
          .max(100, 'Idade máxima não pode ser maior que 100'),
      })
      .optional()
      .refine(
        (data) => {
          if (data && data.min >= data.max) {
            return false;
          }
          return true;
        },
        {
          message: 'Idade mínima deve ser menor que a idade máxima',
        }
      ),
    ultima_interacao: z
      .number()
      .min(1, 'Deve ser pelo menos 1 dia')
      .max(365, 'Máximo 365 dias')
      .default(30)
      .optional(),
    remover_regua_master: z.boolean().default(false).optional(),
    documentacao_principal_enviada: z.boolean().default(false).optional(),
    atualizacao_automatica: z.boolean().default(false).optional(),
  criterios_saida: z.string().optional(),
    nivel_escolaridade: z
      .array(z.string()).optional(),
    id_contato: z.string().optional(),
    marca: z.string().optional(),
    forma_entrada: z.string().optional(),
    forma_ingresso_enem: z.boolean().optional(),
    forma_ingresso_transferencia_externa: z.boolean().optional(),
    forma_ingresso_vestibular: z.boolean().optional(),
    forma_ingresso_ingresso_simplificado: z.boolean().optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      const callCenterSim = data.disponibilizacao_call_center_sim;
      const callCenterNao = data.disponibilizacao_call_center_nao;
      return !(callCenterSim && callCenterNao);
    },
    {
      message: 'Selecione apenas uma opção para Call Center',
      path: ['disponibilizacao_call_center'],
    }
  );

export type AdvancedFilterFormData = z.infer<typeof advancedFilterSchema>;