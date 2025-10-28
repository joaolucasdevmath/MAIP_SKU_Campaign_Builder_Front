'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/Group';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  {
    label: 'Controles de Campos',
    icon: <SettingsIcon />,
    href: '/admin/fields',
  },
  {
    label: 'Gestão de Usuários',
    icon: <GroupIcon />,
    href: '/admin/users',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        minWidth: 220,
        padding: 16,
        background: '#fff',
        boxShadow: '0px 2px 4px 0px #0000000D, 0px 4px 12px 0px #00000012',
        borderRadius: 8,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom style={{ color: '#403D3C' }}>
        MENU ADMIN
      </Typography>
      <List>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const iconStyle = { color: isActive ? '#3958FF' : '#4F4F4F' };
          const textStyle = {
            color: isActive ? '#3958FF' : '#4F4F4F',
            fontWeight: isActive ? 500 : 500,
          };

          return (
            <Link key={item.label} href={item.href} passHref legacyBehavior>
              <ListItem
                button
                component="a"
                style={{
                  borderRadius: 6,
                  marginBottom: 8,
                  
                }}
              >
                <ListItemIcon style={iconStyle}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ style: textStyle }} />
              </ListItem>
            </Link>
          );
        })}
      </List>
    </nav>
  );
}
