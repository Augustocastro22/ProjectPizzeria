import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, TextField, Button, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import './ListadoClientes.css';

const GroupedPizzas = () => {
    const [groupedPizzas, setGroupedPizzas] = useState([]);
    const [editedPizzas, setEditedPizzas] = useState({});

    useEffect(() => {
        const fetchGroupedPizzas = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/grouped_pizzas');
                const data = await response.json();
                setGroupedPizzas(data);
            } catch (error) {
                console.error('There was an error fetching the pizzas!', error);
            }
        };
        fetchGroupedPizzas();
    }, []);

    const handleEditChange = (e, timestamp, id) => {
        const { name, value } = e.target;
        setEditedPizzas(prevState => ({
            ...prevState,
            [timestamp]: {
                ...prevState[timestamp],
                [id]: {
                    ...prevState[timestamp]?.[id],
                    [name]: value
                }
            }
        }));
    };

    const handleSave = async (timestamp, id) => {
        const updatedPizza = editedPizzas[timestamp][id];

        if (!updatedPizza.content) {
            console.error('Content is missing or empty');
            return;
        }

        updatedPizza.timestamp = timestamp;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pizzas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPizza)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'El pedido se ha actualizado correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    setEditedPizzas(prevState => ({
                        ...prevState,
                        [timestamp]: {
                            ...prevState[timestamp],
                            [id]: undefined
                        }
                    }));
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el pedido. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al intentar actualizar el pedido. Por favor, verifica tu conexión.',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleCancelEdit = (timestamp, id) => {
        setEditedPizzas(prevState => ({
            ...prevState,
            [timestamp]: {
                ...prevState[timestamp],
                [id]: undefined
            }
        }));
    };

    const handleDeleteGroup = (group) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará todos los pedidos de este grupo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deletePromises = group.pizzas.map(async (pizza) => {
                    try {
                        await fetch(`http://127.0.0.1:8000/api/pizzas/${pizza.id}`, { method: 'DELETE' });
                    } catch (error) {
                        console.error(`Error deleting pizza with ID ${pizza.id}`, error);
                    }
                });

                await Promise.all(deletePromises);

                Swal.fire(
                    'Eliminado!',
                    'Los pedidos han sido eliminados.',
                    'success'
                );

                setGroupedPizzas(prevGroups => prevGroups.filter(g => g.timestamp !== group.timestamp));
            }
        });
    };

    const handleDeletePizza = (groupTimestamp, pizzaId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará este pedido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/pizzas/${pizzaId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        Swal.fire('Eliminado!', 'El pedido ha sido eliminado.', 'success');
                        setGroupedPizzas(prevGroups =>
                            prevGroups.map(group =>
                                group.timestamp === groupTimestamp
                                    ? { ...group, pizzas: group.pizzas.filter(pizza => pizza.id !== pizzaId) }
                                    : group
                            )
                        );
                    }
                } catch (error) {
                    Swal.fire('Error', 'Hubo un problema al eliminar el pedido. Intenta nuevamente.', 'error');
                }
            }
        });
    };

    return (
        <div className="ListadoClientes">
            <Container sx={{ paddingY: '20px' }}>
                <Typography variant="h2" align="center" gutterBottom sx={{ color: '#0a9fdd', fontWeight: 'bold' }}>
                    Pedidos
                </Typography>
                {groupedPizzas.map(group => (
                    <Box key={group.timestamp} mb={4} sx={{ padding: '20px', borderRadius: '10px', boxShadow: 3, backgroundColor: '#f5f5f5' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Fecha: {new Date(group.timestamp).toLocaleDateString()}
                            </Typography>
                            <Button variant="outlined" color="error" onClick={() => handleDeleteGroup(group)}>
                                Borrar grupo
                            </Button>
                        </Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: '10px', color: '#666' }}>
                            Cliente: {group.pizzas.length > 0 && `${group.pizzas[0].client.fname} ${group.pizzas[0].client.lname}`}
                        </Typography>
                        <List>
                            {group.pizzas.map(pizza => (
                                <ListItem key={pizza.id} sx={{ padding: 0 }}>
                                    <Paper sx={{ width: '100%', display: 'flex', alignItems: 'center', padding: '16px', marginBottom: '10px', borderRadius: '8px' }}>
                                        <ListItemText
                                            primary={
                                                editedPizzas[group.timestamp]?.[pizza.id] ? (
                                                    <TextField
                                                        name="content"
                                                        label="Tipo"
                                                        value={editedPizzas[group.timestamp][pizza.id].content}
                                                        onChange={(e) => handleEditChange(e, group.timestamp, pizza.id)}
                                                        fullWidth
                                                        variant="outlined"
                                                        sx={{ marginRight: '20px' }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#333' }}>
                                                        Id-Pizza: {pizza.id} - Tipo: {pizza.content}
                                                    </Typography>
                                                )
                                            }
                                        />
                                        {editedPizzas[group.timestamp]?.[pizza.id] ? (
                                            <>
                                                <Button onClick={() => handleCancelEdit(group.timestamp, pizza.id)} variant="outlined" color="secondary" sx={{ marginRight: '8px', marginLeft: '8px' }}>
                                                    Cancelar
                                                </Button>
                                                <Button onClick={() => handleSave(group.timestamp, pizza.id)} variant="contained" color="primary">
                                                    Guardar
                                                </Button>
                                            </>
                                        ) : (
                                            <Button onClick={() => setEditedPizzas(prevState => ({
                                                ...prevState,
                                                [group.timestamp]: {
                                                    ...prevState[group.timestamp],
                                                    [pizza.id]: { content: pizza.content }
                                                }
                                            }))} variant="outlined" color="primary" sx={{ marginLeft: 'auto' }}>
                                                Editar
                                            </Button>
                                        )}
                                        <IconButton  onClick={() => handleDeletePizza(group.timestamp, pizza.id)} sx={{ marginLeft: '8px' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                ))}
            </Container>
        </div>
    );
};

export default GroupedPizzas;
