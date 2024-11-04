import React, {useState, useEffect} from 'react';
import {Container, Typography, Box, List, ListItem, ListItemText, TextField, Button, Paper} from '@mui/material';
import Swal from 'sweetalert2'; // Asegúrate de importar SweetAlert2

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
        const {name, value} = e.target;
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

    // Incluye el timestamp existente
    updatedPizza.timestamp = timestamp; // Asigna la fecha existente

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/pizzas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPizza)
        });

        if (response.ok) {
            const savedPizza = await response.json();
            // Actualiza el estado local con la pizza guardada

            // Muestra un SweetAlert de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'El pedido se ha actualizado correctamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                // Restablecer el estado de editedPizzas
                setEditedPizzas(prevState => ({
                    ...prevState,
                    [timestamp]: {
                        ...prevState[timestamp],
                        [id]: undefined // Elimina la pizza editada del estado
                    }
                }));
            });
        } else {
            const errorResponse = await response.json();
            console.error('Failed to update the pizza', response.statusText, errorResponse);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el pedido. Inténtalo de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('There was an error updating the pizza!', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al intentar actualizar el pedido. Por favor, verifica tu conexión.',
            confirmButtonText: 'Aceptar'
        });
    }
};



    return (
        <Container>
            <Typography variant="h1">Pedidos</Typography>
            {groupedPizzas.map(group => (
                <Box key={group.timestamp} mb={4}>
                    <Typography variant="h3">Fecha: {new Date(group.timestamp).toLocaleDateString()}</Typography>
                    <Typography
                        variant="h4">Cliente: {group.pizzas.length > 0 && `${group.pizzas[0].client.fname} ${group.pizzas[0].client.lname}`}</Typography>
                    <List>
                        {group.pizzas.map(pizza => (
                            <ListItem key={pizza.id}>
                                <Paper style={{padding: '16px', width: '100%', display: 'flex', alignItems: 'center'}}>
                                    <ListItemText
                                        primary={
                                            editedPizzas[group.timestamp]?.[pizza.id] ? (
                                                <TextField
                                                    name="content"
                                                    label="Tipo"
                                                    value={editedPizzas[group.timestamp][pizza.id].content}
                                                    onChange={(e) => handleEditChange(e, group.timestamp, pizza.id)}
                                                    fullWidth
                                                />
                                            ) : (
                                                `Id-Pizza: ${pizza.id} Tipo: ${pizza.content}`
                                            )
                                        }
                                    />
                                    {editedPizzas[group.timestamp]?.[pizza.id] ? (
                                        <Button onClick={() => handleSave(group.timestamp, pizza.id)}
                                                variant="contained" color="primary">Save</Button>
                                    ) : (
                                        <Button onClick={() => setEditedPizzas(prevState => ({
                                            ...prevState,
                                            [group.timestamp]: {
                                                ...prevState[group.timestamp],
                                                [pizza.id]: {content: pizza.content}
                                            }
                                        }))} variant="contained">Edit</Button>
                                    )}
                                </Paper>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}
        </Container>
    );
};

export default GroupedPizzas;