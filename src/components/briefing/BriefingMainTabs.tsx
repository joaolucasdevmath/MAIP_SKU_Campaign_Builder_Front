"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const mainTabs = [
  { label: 'Formulário', value: 'form', path: '/briefing/basic-info' },
  { label: 'Templates de Campanha', value: 'templates', path: '/briefing/templates-campanha' },
  { label: 'Histórico de Briefings', value: 'history', path: '/briefing/history' },
];

export default function BriefingMainTabs() {
  const router = useRouter();
  const pathname = usePathname()?.replace(/\/$/, '') || '';
  const activeTabIndex = mainTabs.findIndex(tab => pathname === tab.path.replace(/\/$/, ''));
  const [currentTab, setCurrentTab] = useState(activeTabIndex === -1 ? 0 : activeTabIndex);

  useEffect(() => {
    setCurrentTab(activeTabIndex === -1 ? 0 : activeTabIndex);
  }, [pathname, activeTabIndex]);

  const handleChange = (newValue: number) => {
    setCurrentTab(newValue);
    router.push(mainTabs[newValue].path);
  };

  const goToPrevTab = () => {
    setCurrentTab((prev) => (prev > 0 ? prev - 1 : mainTabs.length - 1));
    router.push(mainTabs[currentTab > 0 ? currentTab - 1 : mainTabs.length - 1].path);
  };

  const goToNextTab = () => {
    setCurrentTab((prev) => (prev < mainTabs.length - 1 ? prev + 1 : 0));
    router.push(mainTabs[currentTab < mainTabs.length - 1 ? currentTab + 1 : 0].path);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1000 },
          mx: 'auto',
          bgcolor: '#f5f8fa',
          borderRadius: 2,
          p: { xs: 0.5, sm: 1, md: 2 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: 'none',
          height: { xs: 48, sm: 56, md: 56 },
          position: 'relative',
        }}
      >
        {/* Navegação para mobile */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <IconButton
            onClick={goToPrevTab}
            sx={{ color: '#003768', p: 0.5 }}
            aria-label="Previous tab"
          >
            <ArrowBackIosIcon />
          </IconButton>
          <Tab
            label={<span style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{mainTabs[currentTab].label}</span>}
            sx={{
              minHeight: 36,
              height: 36,
              fontWeight: 600,
              fontSize: 14,
              color: '#003768',
              bgcolor: '#fff',
              borderRadius: 2,
              mx: 0.5,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
              flex: '1 1 auto',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 0.25,
            }}
          />
          <IconButton
            onClick={goToNextTab}
            sx={{ color: '#003768', p: 0.5 }}
            aria-label="Next tab"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        {/* Tabs para web */}
        <Tabs
          value={currentTab}
          onChange={(_event, newValue) => handleChange(newValue)}
          variant="standard"
          scrollButtons={false}
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            display: { xs: 'none', md: 'block' },
            minHeight: 48,
            height: 48,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'space-between',
            },
          }}
        >
          {mainTabs.map((tab, idx) => {
            const isActive = currentTab === idx;
            return (
              <Tab
                key={tab.value}
                label={<span style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{tab.label}</span>}
                sx={{
                  minHeight: 44,
                  height: 48,
                  fontWeight: 600,
                  fontSize: 18,
                  color: isActive ? '#003768' : '#6c757d',
                  bgcolor: isActive ? '#fff' : 'transparent',
                  borderRadius: 2,
                  mx: isActive ? 0 : 1,
                  boxShadow: isActive ? '0 2px 8px 0 rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.2s',
                  flex: '1 1 0',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 0.5,
                }}
              />
            );
          })}
        </Tabs>
      </Box>
    </Box>
  );
}