// src/Home.js
import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { Link } from 'react-router-dom';

// Imagen fija para el banner principal
const bannerImage = '/images/banner1.jpg';

// Lista de banners de acceso rápido
const quickAccess = [
  { title: 'Listado de Clientes', image: '/images/clientes.jpg', link: '/clientes' },
  { title: 'Listado de Pedidos', image: '/images/pedidos.jpg', link: '/ListaPedidos' },
  { title: 'Nuevo Pedido', image: '/images/nuevopedido.jpg', link: '/pedidos' },
];

const Home = () => {
  return (
    <Box sx={{ padding: '20px' }}>
      {/* Banner fijo principal */}
      <Box sx={{ width: '100%', height: '300px', marginBottom: '30px', borderRadius: '10px', overflow: 'hidden' }}>
        <img src={bannerImage} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: '20px',
          marginTop: '30px'
        }}
      >
        {quickAccess.map((item, index) => (
          <Link to={item.link} key={index} style={{ textDecoration: 'none', width: '100%', height: '100%' }}>
            <Card sx={{ cursor: 'pointer', width: { xs: '100%', sm: '100%' }, height: '350px' }}>
              <CardMedia component="img" image={item.image} alt={item.title} height="280" style={{ borderRadius: '8px 8px 0 0' }} />
              <CardContent>
                <Typography variant="h6" align="center">{item.title}</Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default Home;
