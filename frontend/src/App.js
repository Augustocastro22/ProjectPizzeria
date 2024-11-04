// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Container } from '@mui/material';
import Home from './Home';
import ListadoClientes from './ListadoClientes';
import PedidoNuevo from './PedidoNuevo';
import ListaPedidos from './ListaPedidos';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Barra de navegación fija */}
        <Container sx={{ marginTop: '80px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<ListadoClientes />} />
            <Route path="/pedidos" element={<PedidoNuevo />} />
            <Route path="/ListaPedidos" element={<ListaPedidos />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
