import { z } from 'zod';

export const reviewGenerationSchema = z.object({
  // Campo para notas/observações adicionais do usuário
  notas: z.string().optional(),
  
  // Campo para aprovação final
  aprovacao: z.boolean().default(false),
  
  // Campo para modo de execução da campanha
  modo_execucao: z.enum(['imediato', 'agendado']).default('imediato'),
  
  // Campo para data de agendamento (opcional)
  data_agendamento: z.string().optional(),
  
  // Campo para hora de agendamento (opcional)
  hora_agendamento: z.string().optional(),
  
  // Campo para confirmação de dados
  confirmar_dados: z.boolean().default(false),
});

export type ReviewGenerationFormData = z.infer<typeof reviewGenerationSchema>;