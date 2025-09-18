// Configuração dos steps do wizard
export const WIZARD_STEPS = {
  totalSteps: 4,
  steps: [
    {
      step: 1,
      route: '/briefing/basic-info',
      title: 'Informações Básicas da Campanha'
    },
    {
      step: 2,
      route: '/briefing/audience-definition',
      title: 'Audiência e Segmentação'
    },
    {
      step: 3,
      route: '/briefing/advanced-filter',
      title: 'Configurações e Insights'
    },
    {
      step: 4,
      route: '/briefing/review-generation',
      title: 'Revisão e Finalização'
    }
  ]
};

export const getStepTitles = () => WIZARD_STEPS.steps.map(step => step.title);

export const getCurrentStep = (pathname: string) => {
  const step = WIZARD_STEPS.steps.find(s => s.route === pathname);
  return step ? step.step : 1;
};

export const getStepTitle = (pathname: string) => {
  const step = WIZARD_STEPS.steps.find(s => s.route === pathname);
  return step ? step.title : WIZARD_STEPS.steps[0].title;
};