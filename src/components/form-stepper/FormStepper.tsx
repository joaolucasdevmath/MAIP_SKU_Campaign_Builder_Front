import React from 'react';
import { usePathname } from 'next/navigation';

import { Box, Typography } from '@mui/material';

import { WIZARD_STEPS, getStepTitle, getCurrentStep } from 'src/config/wizard-steps';

interface FormStepperProps {
  // Props opcionais - se não fornecidas, detecta automaticamente da rota
  currentStep?: number;
  totalSteps?: number;
  stepTitles?: string[];
}

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep: propCurrentStep,
  totalSteps: propTotalSteps,
  stepTitles: propStepTitles,
}) => {
  const pathname = usePathname();

  // Usa props se fornecidas, senão detecta automaticamente
  const currentStep = propCurrentStep ?? getCurrentStep(pathname);
  const totalSteps = propTotalSteps ?? WIZARD_STEPS.totalSteps;
  const currentTitle = getStepTitle(pathname);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} justifyContent="center">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <Box key={stepNumber}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: isActive ? '#093366' : isCompleted ? '#22c55e' : '#f3f4f6',
                  color: isActive || isCompleted ? '#fff' : '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 22,
                  boxShadow: isActive ? '0 0 0 2px #09336633' : undefined,
                  transition: 'background 0.2s',
                }}
              >
                {stepNumber}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Typography variant="h6" align="center" mt={2}>
        {currentTitle}
      </Typography>
    </Box>
  );
};

export default FormStepper;
