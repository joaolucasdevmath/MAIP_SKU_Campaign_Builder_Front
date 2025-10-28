const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
  BASIC_INFO: '/briefing/basic-info',
  AUDIENCE_DEFINITION: '/briefing/audience-definition',
  ADVANCED_FILTER: '/briefing/advanced-filter',
  REVIEW_GENERATION: '/briefing/review-generation',
  AUDIENCE: '/audience',
  INSIGHTS: '/insights',
  TEMPLATES: '/briefing/templates-campanha',
  HISTORY: '/briefing/history',
  ADMIN: '/admin',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
    },
  },

  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,

    general: {
      app: `${ROOTS.DASHBOARD}/app`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
  },

  // BRIEFING FLOW
  briefing: {
    basicInfo: ROOTS.BASIC_INFO,
    audienceDefinition: ROOTS.AUDIENCE_DEFINITION,
    advancedFilter: ROOTS.ADVANCED_FILTER,
    reviewGeneration: ROOTS.REVIEW_GENERATION,
  },

  audience: ROOTS.AUDIENCE,
  insights: ROOTS.INSIGHTS,
  templates: ROOTS.TEMPLATES,
  history: ROOTS.HISTORY,
  admin: ROOTS.ADMIN, // <-- Adicionado
};
