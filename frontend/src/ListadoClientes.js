import logo from './logo.svg';
import './ListadoClientes.css';

import React, { useEffect, useState } from 'react';
import {IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function ListadoClientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Hacer una solicitud al backend para obtener los clientes
    fetch('http://127.0.0.1:8000/api/clientes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }
        return response.json();
      })
      .then((data) => {
        setClientes(data); // Guardar los datos de clientes en el estado
      })
      .catch((error) => {
        console.error('Error al obtener los clientes:', error);
      });
  }, []);

 const handleEdit = (cliente) => {
  // Pedir al usuario que ingrese el nuevo nombre
  const nuevoNombre = prompt("Nuevo nombre:", cliente.fname);

  // Si el usuario cancela el prompt, no se hace nada
  if (!nuevoNombre) return;

  // Crear el objeto actualizado con el nuevo nombre
  const updatedCliente = { fname: nuevoNombre };

  fetch(`http://127.0.0.1:8000/api/clientes/${cliente.lname}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedCliente) // Convertir el objeto a JSON
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Error al actualizar el cliente');
    }
    return response.json();
  })
  .then((updatedCliente) => {
    // Actualizar el estado del cliente en la lista
    setClientes((prevClientes) =>
      prevClientes.map((c) => (c.lname === cliente.lname ? updatedCliente : c))
    );
  })
  .catch((error) => console.error('Error al editar el cliente:', error));
};


  const handleDelete = (lname) => {
  // Pregunta al usuario si está seguro de querer eliminar el cliente
  const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a ${lname}?`);

  // Si el usuario confirma, procede con la eliminación
  if (confirmDelete) {
    fetch(`http://127.0.0.1:8000/api/clientes/${lname}`, {
      method: 'DELETE'
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }
      // Actualiza el estado para eliminar el cliente de la lista
      setClientes((prevClientes) => prevClientes.filter((c) => c.lname !== lname));
    })
    .catch((error) => console.error('Error al eliminar el cliente:', error));
  }
};


  return (
    <div className="ListadoClientes">
      <header className="ListadoClientes-header">
        <h1>Lista de Clientes</h1>
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
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.dni}</TableCell>
                  <TableCell>{cliente.fname}</TableCell>
                  <TableCell>{cliente.lname}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(cliente.lname)}>
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
