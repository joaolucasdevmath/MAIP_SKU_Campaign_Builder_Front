import { z } from "zod";

export const canais = [
  { label: "Email" },
  { label: "SMS" },
  { label: "DMA" },
  { label: "Whatsapp Nativo" },
  { label: "Whatsapp Blip" },
  { label: "Call Center" },
];




function getQuantityFieldsSchema(channelList: Array<{ label: string }>): Record<string, z.ZodTypeAny> {
  const fields: Record<string, z.ZodTypeAny> = {};
  channelList.forEach((c: { label: string }) => {
    
    const key = `quantity_${c.label}`;
    fields[key] = z
      .number({ invalid_type_error: 'Informe um número válido.' })
      .min(0, 'O valor não pode ser negativo.')
      .optional();
  });
  return fields;
}

export const basicInfoSchema = z.object({
  campaign_name: z.string().min(1, 'Nome da campanha é obrigatório'),
  campaign_objective: z.union([
    z.string().min(1, 'Objetivo obrigatório'),
    z.array(z.string().min(1, 'Objetivo obrigatório')).min(1, 'Objetivo obrigatório')
  ]),
  campaign_type: z.union([z.string().min(1, 'Tipo obrigatório'), z.array(z.string()).min(1, 'Tipo obrigatório')]),
  channel: z.union([z.string().min(1, 'Canal obrigatório'), z.array(z.string()).min(1, 'Canal obrigatório')]),
  offer: z.string().optional(),
  campaign_codes: z.string().optional(),
  start_date: z.any(),
  end_date: z.any(),
  is_continuous: z.boolean().optional(),
  disponibilizacao_call_center_sim: z.boolean().default(false).optional(),
  disponibilizacao_call_center_nao: z.boolean().default(false).optional(),
  informacoes_extras: z.string().optional(),
  ...getQuantityFieldsSchema(canais),
}).passthrough();

// Schema legacy para compatibilidade
export const legacyBasicInfoSchema = z.object({
  campaignName: z.string({ required_error: "Obrigatório" }).min(1, "Obrigatório").describe("Nome da Campanha"),
  campaignType: z.string({ required_error: "Obrigatório" }).min(1, "Obrigatório").describe("Tipo da Campanha"),
  campaignObjective: z.string({ required_error: "Obrigatório" }).min(1, "Obrigatório").describe("Objetivo da Campanha"),
  offer: z.string({ required_error: "Obrigatório" }).min(1, "Obrigatório").describe("Oferta(s)").describe("Descreva as ofertas desta campanha para histórico e referência futura."),
  campaignCode: z.string().optional().describe("Código da Campanha (Opcional)"),
  channel: z.object({ label: z.string() }).nullable().describe("Tipo de Disparo"),
  quantity: z.string({ required_error: "Obrigatório" }).min(1, "Obrigatório").describe("Quantidade de Disparos por Canal"),
  startDate: z.any().describe("Data de Início da Campanha"),
  endDate: z.any().describe("Data de Fim da Campanha"),
  isContinuous: z.boolean().describe("Campanha Contínua"),
});
