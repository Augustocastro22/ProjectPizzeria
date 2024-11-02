import logo from './logo.svg';
import './ListadoClientes.css';

import React, { useEffect, useState } from 'react';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function ListadoClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda por apellido
  const [dniSearchTerm, setDniSearchTerm] = useState(''); // Estado para la búsqueda por DNI

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/clientes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setClientes(data);
      })
      .catch((error) => {
        console.error('Error al obtener los clientes:', error);
      });
  }, []);

  const handleEdit = (cliente) => {
    const nuevoNombre = prompt("Nuevo nombre:", cliente.fname);
    if (!nuevoNombre) return;
    const updatedCliente = { fname: nuevoNombre };

    fetch(`http://127.0.0.1:8000/api/clientes/${cliente.lname}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedCliente)
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el cliente');
      }
      return response.json();
    })
    .then((updatedCliente) => {
      setClientes((prevClientes) =>
        prevClientes.map((c) => (c.lname === cliente.lname ? updatedCliente : c))
      );
    })
    .catch((error) => console.error('Error al editar el cliente:', error));
  };

  const handleDelete = (lname) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${lname}?`);
    if (confirmDelete) {
      fetch(`http://127.0.0.1:8000/api/clientes/${lname}`, {
        method: 'DELETE'
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al eliminar el cliente');
        }
        setClientes((prevClientes) => prevClientes.filter((c) => c.lname !== lname));
      })
      .catch((error) => console.error('Error al eliminar el cliente:', error));
    }
  };

  // Filtrar clientes en base al término de búsqueda de apellido y coincidencia inicial en DNI
  const filteredClientes = clientes.filter((cliente) =>
    cliente.lname.toLowerCase().includes(searchTerm.toLowerCase()) &&
    cliente.dni.toString().startsWith(dniSearchTerm) // Verifica que el DNI empiece con los caracteres de búsqueda
  );

  return (
    <div className="ListadoClientes">
      <header className="ListadoClientes-header">
        <h1>Lista de Clientes</h1>

        {/* Campo de búsqueda por apellido */}
        <TextField
          label="Buscar por apellido"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: '20px', width: '100%' }}
        />

        {/* Campo de búsqueda por DNI */}
        <TextField
          label="Buscar por DNI"
          variant="outlined"
          value={dniSearchTerm}
          onChange={(e) => setDniSearchTerm(e.target.value)}
          sx={{ marginBottom: '20px', width: '100%' }}
        />

        <TableContainer component={Paper}>
          <Table aria-label="Clientes">
            <TableHead>
              <TableRow>
                <TableCell>DNI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.dni}</TableCell>
                  <TableCell>{cliente.fname}</TableCell>
                  <TableCell>{cliente.lname}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(cliente)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(cliente.lname)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </header>
    </div>
  );
}

export default ListadoClientes;
