'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Table,
  Paper,
  Switch,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';


type User = {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};


const mockUsers: User[] = [
  { id: 1, email: 'joao@example.com', role: 'Admin', status: 'Ativo', createdAt: '01/10/2025' },
  {
    id: 2,
    email: 'maria@example.com',
    role: 'Usuário',
    status: 'Inativo',
    createdAt: '02/10/2025',
  },
  { id: 3, email: 'pedro@example.com', role: 'Usuário', status: 'Ativo', createdAt: '03/10/2025' },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(mockUsers);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

 
  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

 
  const handleToggleStatus = (userId: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'Ativo' ? 'Inativo' : 'Ativo' }
          : user
      )
    );
   
  };

  
  const handleDeleteUser = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
   
  };

  
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;

  return (
    <Box sx={{ padding: '16px' }}>
      {/* Conteúdo Principal */}
      <Typography variant="h3" gutterBottom sx={{ color: '#1B1919' }}>
        Gestão de Usuários
      </Typography>
      <Typography variant="body1" gutterBottom>
        Gerencie os usuários e seus respectivos acessos.
      </Typography>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            width: 1156,
            height: 508,
            opacity: 1,
            position: 'absolute',
            top: 200,
            left: 260,
            padding: '8px 16px',
            borderRadius: 2,
            boxShadow: '0px 10px 20px -2px #0000000A, 0px 2px 15px -3px #00000012',
            ml: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ mt: 1, mb: 2, color: '#1B1919' }}
          >
            Usuários Cadastrados
          </Typography>
          <Typography
            variant="body2"
            color="body1"
            gutterBottom
            sx={{ mt: -1, mb: 2, color: '#1B1919' }}
          >
            Listagem de usuários cadastrados
          </Typography>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'Selecionar todos os usuários' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    E-mail
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    Tipo de acesso
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    Ativar/Inativar
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    Criado em
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={400}>
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      inputProps={{ 'aria-label': `Selecionar usuário ${user.email}` }}
                      sx={{
                        color: '#3958FF',
                        '&.Mui-checked': {
                          color: '#3958FF',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.status === 'Ativo'}
                      onChange={() => handleToggleStatus(user.id)}
                      inputProps={{ 'aria-label': `Alternar status de ${user.email}` }}
                      icon={
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          <CloseIcon style={{ color: '#fff', fontSize: 18 }} />
                        </span>
                      }
                      checkedIcon={
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          <CheckIcon style={{ color: '#3958FF', fontSize: 18 }} />
                        </span>
                      }
                      sx={{
                        width: 64,
                        '& .MuiSwitch-track': {
                          height: 24,
                          borderRadius: 4,
                          backgroundColor: user.status === 'Ativo' ? '#3958FF' : '#BDBDBD',
                          opacity: 1,
                        },
                        '& .MuiSwitch-thumb': {
                          width: 24,
                          height: 24,
                          backgroundColor: 'transparent',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <IconButton
                      component={Link}
                      href={`/admin/users/edit/${user.id}`}
                      aria-label={`Editar usuário ${user.email}`}
                    >
                      <EditIcon sx={{ color: '#1B1919' }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label={`Excluir usuário ${user.email}`}
                    >
                      <DeleteIcon sx={{ color: '#F80B11' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
