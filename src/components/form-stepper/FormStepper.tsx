import React from 'react';

import { Box, Typography } from "@mui/material";

interface FormStepperProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => (
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
                borderRadius: "50%",
                bgcolor: isActive ? "#093366" : isCompleted ? "#22c55e" : "#f3f4f6",
                color: isActive || isCompleted ? "#fff" : "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 22,
                boxShadow: isActive ? "0 0 0 2px #09336633" : undefined,
                transition: "background 0.2s",
              }}
            >
              {stepNumber}
            </Box>
          </Box>
        );
      })}
    </Box>
    {stepTitles && stepTitles[currentStep - 1] && (
      <Typography variant="h6" align="center" mt={2}>
        {stepTitles[currentStep - 1]}
      </Typography>
    )}
  </Box>
);

export default FormStepper;
