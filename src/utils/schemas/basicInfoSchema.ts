import { z } from "zod";

export const canais = [
  { label: "Email" },
  { label: "SMS" },
  { label: "DMA" },
  { label: "Whatsapp Nativo" },
  { label: "Whatsapp Blip" },
  { label: "Call Center" },
];

export const basicInfoSchema = z.object({
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
