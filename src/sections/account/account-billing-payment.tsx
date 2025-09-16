import type { IPaymentCard } from 'src/types/common';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  cards: IPaymentCard[];
};

export function AccountBillingPayment({ cards }: Props) {
  const newCard = useBoolean();

  return (
    <Card sx={{ my: 3 }}>
      <CardHeader
        title="Payment method"
        action={
          <Button
            size="small"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={newCard.onTrue}
          >
            New Card
          </Button>
        }
      />
    </Card>
  );
}
