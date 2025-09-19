import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import { useFormWizardContext } from 'src/context/FormWizardContext';
import { reviewGenerationSchema, type ReviewGenerationFormData } from 'src/utils/schemas/reviewGenerationSchema';

export interface UseReviewGenerationFormProps {
  defaultValues?: Partial<ReviewGenerationFormData>;
}

export function useReviewGenerationForm({ defaultValues }: UseReviewGenerationFormProps) {
  const router = useRouter();
  const { formData, updateFormData } = useFormWizardContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campanha, setCampanha] = useState<any>(null);
  const [resumo, setResumo] = useState<any>(null);

  const methods = useForm<ReviewGenerationFormData>({
    resolver: zodResolver(reviewGenerationSchema),
    defaultValues: {
      notas: '',
      aprovacao: false,
      modo_execucao: 'imediato',
      data_agendamento: '',
      hora_agendamento: '',
      confirmar_dados: false,
      ...defaultValues,
      ...formData.step4,
    },
  });

  const { control, handleSubmit, watch, setValue, reset } = methods;

  // Função para gerar a campanha final
  const gerarCampanha = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Dados de todos os steps
      const dadosCompletos = {
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3,
        step4: formData.step4,
      };

      console.log('Gerando campanha com dados:', dadosCompletos);

      // Chamada para API de geração da campanha
      const response = await axios.post('/api/briefing/gerar-campanha', dadosCompletos);
      
      if (response.data) {
        setCampanha(response.data);
        console.log('Campanha gerada com sucesso:', response.data);
      }
    } catch (err: any) {
      console.error('Erro ao gerar campanha:', err);
      setError(err.response?.data?.message || 'Erro ao gerar campanha');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Função para buscar resumo dos dados
  const buscarResumo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Dados de todos os steps
      const dadosCompletos = {
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3,
      };

      console.log('Buscando resumo com dados:', dadosCompletos);

      // Chamada para API de resumo
      const response = await axios.post('/api/briefing/resumo', dadosCompletos);
      
      if (response.data) {
        setResumo(response.data);
        console.log('Resumo carregado:', response.data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar resumo:', err);
      setError(err.response?.data?.message || 'Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Carrega resumo ao montar o componente
  useEffect(() => {
    buscarResumo();
  }, [buscarResumo]);

  // Função para navegar para o step anterior
  const handlePrevious = useCallback(() => {
    router.push('/briefing/advanced-filter');
  }, [router]);

  // Função para submeter o formulário
  const onSubmit = useCallback(
    async (data: ReviewGenerationFormData) => {
      console.log('Dados do step 4 submetidos:', data);
      
      // Atualiza dados no contexto
      updateFormData('step4', data);
      
      // Gera a campanha
      await gerarCampanha();
    },
    [updateFormData, gerarCampanha]
  );

  // Função para finalizar campanha
  const handleFinalizar = useCallback(
    async (data: ReviewGenerationFormData) => {
      if (!data.confirmar_dados) {
        setError('Por favor, confirme os dados antes de finalizar.');
        return;
      }

      if (!data.aprovacao) {
        setError('Por favor, aprove a campanha antes de finalizar.');
        return;
      }

      console.log('Finalizando campanha:', data);
      
      // Atualiza dados no contexto
      updateFormData('step4', data);
      
      try {
        setLoading(true);
        setError(null);

        // Dados completos para finalização
        const dadosCompletos = {
          ...formData,
          step4: data,
        };

        console.log('Finalizando campanha com dados:', dadosCompletos);

        // Chamada para API de finalização
        const response = await axios.post('/api/briefing/finalizar', dadosCompletos);
        
        if (response.data) {
          console.log('Campanha finalizada com sucesso:', response.data);
          
          // Limpa dados do contexto
          updateFormData('step1', {});
          updateFormData('step2', {});
          updateFormData('step3', {});
          updateFormData('step4', {});
          
          // Redireciona para página de sucesso ou dashboard
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error('Erro ao finalizar campanha:', err);
        setError(err.response?.data?.message || 'Erro ao finalizar campanha');
      } finally {
        setLoading(false);
      }
    },
    [formData, updateFormData, router]
  );

  // Watch para mudanças no modo de execução
  const modoExecucao = watch('modo_execucao');

  // Reseta campos de agendamento quando modo muda para imediato
  useEffect(() => {
    if (modoExecucao === 'imediato') {
      setValue('data_agendamento', '');
      setValue('hora_agendamento', '');
    }
  }, [modoExecucao, setValue]);

  return {
    // Form methods
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    ...methods,

    // Estado
    loading,
    error,
    campanha,
    resumo,

    // Handlers
    onSubmit,
    handlePrevious,
    handleFinalizar,
    gerarCampanha,
    buscarResumo,

    // Computed
    modoExecucao,
    
    // Dados do contexto
    formData,
  };
}