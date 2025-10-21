import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------


const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });


axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
 
   briefing: {
    step1: '/api/briefing/step/1',
    step2: '/api/briefing/step/2',
    step2Segment: (source_base_id: string) => `/api/briefing/step/2/${source_base_id}`,
    step3Segment: (source_base_id: string) => `/api/briefing/step/3/${source_base_id}`,
    post: '/api/briefing/',
    generate: '/api/briefing/generate',
    generateQuery: '/api/generate/audience_query',
    campaignData: '/api/generate/campaign_data',
    saveTemplate: '/api/template/',
    getTemplate: '/api/template/',
    loginBasic: '/api/auth/basic/',
    loginAzure: '/api/auth/azure/',
    archive: '/api/archive/',
    archiveSave: '/api/archive/',
  archiveId: (id: string) => `/api/archive/${id}`,
  generateMarketingCloud: '/api/generate/marketing_cloud_flow',
  getUserMe: '/api/user/me',
  generateInsight: '/api/generate/insight'
   
  }
};
