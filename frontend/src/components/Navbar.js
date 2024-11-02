import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Texto "Surffing Pizza" como enlace a la Home */}
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Surfing Pizza
        </Typography>

        {/* Botones de navegación */}
        <Button color="inherit" component={Link} to="/clientes">
          Clientes
        </Button>
        <Button color="inherit" component={Link} to="/pedidos">
          Nuevo pedido
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
