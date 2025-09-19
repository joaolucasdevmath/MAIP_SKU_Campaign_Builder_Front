import { z } from "zod";

// Schema para o step2 - Definição do Público
export const audienceDefinitionSchema = z.object({
  source_base: z.string().min(1, 'Base de origem é obrigatória'),
  segmentation: z.array(z.string()).min(1, 'Segmentação é obrigatória'),
}).passthrough();

export type AudienceDefinitionFormData = z.infer<typeof audienceDefinitionSchema>;