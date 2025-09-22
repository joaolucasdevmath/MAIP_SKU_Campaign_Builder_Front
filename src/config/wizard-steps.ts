// Configuração dos steps do wizard
export const WIZARD_STEPS = {
  totalSteps: 4,
  steps: [
    {
      step: 1,
      route: '/briefing/basic-info',
      title: 'Etapa 1 de 4: Informações Básicas da Campanha'
    },
    {
      step: 2,
      route: '/briefing/audience-definition',
      title: 'Etapa 2 de 4: Definição do Público'
    },
    {
      step: 3,
      route: '/briefing/advanced-filter',
      title: 'Etapa 3 de 4: Filtros Avançados'
    },
    {
      step: 4,
      route: '/briefing/review-generation',
      title: 'Etapa 4 de 4: Revisão e Finalização'
    }
  ]
};

export const getStepTitles = () => WIZARD_STEPS.steps.map(step => step.title);

export const getCurrentStep = (pathname: string) => {

  const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const step = WIZARD_STEPS.steps.find(s => s.route === normalizedPathname);
  return step ? step.step : 1;
};

export const getStepTitle = (pathname: string) => {
 
  const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const step = WIZARD_STEPS.steps.find(s => s.route === normalizedPathname);
  return step ? step.title : WIZARD_STEPS.steps[0].title;
};