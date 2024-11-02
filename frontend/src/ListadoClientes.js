import React, { useEffect, useState } from 'react';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function ListadoClientes() {
  const [clientes, setClientes] = useState([]);
  const [editingClienteId, setEditingClienteId] = useState(null);
  const [editedCliente, setEditedCliente] = useState({});

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
    setEditingClienteId(cliente.id);
    setEditedCliente(cliente);
  };

  const handleSave = () => {
    fetch(`http://127.0.0.1:8000/api/clientes/${editedCliente.lname}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedCliente)
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al actualizar el cliente');
      }
      return response.json();
    })
    .then((updatedCliente) => {
      setClientes((prevClientes) =>
        prevClientes.map((c) => (c.id === updatedCliente.id ? updatedCliente : c))
      );
      setEditingClienteId(null);
      setEditedCliente({});
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCliente({ ...editedCliente, [name]: value });
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
                  <TableCell>
                    {editingClienteId === cliente.id ? (
                      <TextField
                        name="fname"
                        value={editedCliente.fname}
                        onChange={handleInputChange}
                      />
                    ) : (
                      cliente.fname
                    )}
                  </TableCell>
                  <TableCell>
                    {editingClienteId === cliente.id ? (
                      <TextField
                        name="lname"
                        value={editedCliente.lname}
                        onChange={handleInputChange}
                      />
                    ) : (
                      cliente.lname
                    )}
                  </TableCell>
                  <TableCell>
                    {editingClienteId === cliente.id ? (
                      <Button variant="contained" color="primary" onClick={handleSave}>
                        Guardar
                      </Button>
                    ) : (
                      <IconButton color="primary" onClick={() => handleEdit(cliente)}>
                        <EditIcon />
                      </IconButton>
                    )}
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
