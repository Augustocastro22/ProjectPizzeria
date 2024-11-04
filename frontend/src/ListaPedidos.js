import React, {useState, useEffect} from 'react';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    TextField,
    Button,
    Paper,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import './ListadoClientes.css';

const GroupedPizzas = () => {
    const [groupedPizzas, setGroupedPizzas] = useState([]);
    const [editedPizzas, setEditedPizzas] = useState({});
    const [newPizza, setNewPizza] = useState({type: '', customName: ''});
    const [clientFilter, setClientFilter] = useState(''); // Filtro por cliente
    const [dateFilter, setDateFilter] = useState('');     // Filtro por fecha
    const [dateEdits, setDateEdits] = useState({}); // Estado para almacenar la fecha y hora de edición para cada grupo
    const [isEditingDate, setIsEditingDate] = useState({}); // Estado para controlar la visibilidad del editor de fecha


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

        const formattedPizza = {
            person_id: updatedPizza.person_id,
            content: updatedPizza.content,
            timestamp: timestamp
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pizzas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedPizza)
            });

            if (response.ok) {
                const updatedPizzaFromServer = await response.json();

                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'El item se ha actualizado correctamente.',
                    confirmButtonText: 'Aceptar'
                });

                setGroupedPizzas(prevGroups =>
                    prevGroups.map(group =>
                        group.timestamp === timestamp
                            ? {
                                ...group,
                                pizzas: group.pizzas.map(pizza =>
                                    pizza.id === id ? { ...pizza, ...updatedPizzaFromServer } : pizza
                                )
                              }
                            : group
                    )
                );

                setEditedPizzas(prevState => ({
                    ...prevState,
                    [timestamp]: {
                        ...prevState[timestamp],
                        [id]: undefined
                    }
                }));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el item. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al intentar actualizar el item. Por favor, verifica tu conexión.',
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
            text: "Esta acción eliminará todos los items de este pedido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deletePromises = group.pizzas.map(async (pizza) => {
                    try {
                        await fetch(`http://127.0.0.1:8000/api/pizzas/${pizza.id}`, {method: 'DELETE'});
                    } catch (error) {
                        console.error(`Error deleting pizza with ID ${pizza.id}`, error);
                    }
                });

                await Promise.all(deletePromises);

                Swal.fire(
                    'Eliminado!',
                    'El pedido han sido eliminados.',
                    'success'
                );

                setGroupedPizzas(prevGroups => prevGroups.filter(g => g.timestamp !== group.timestamp));
            }
        });
    };

    const handleDeletePizza = (groupTimestamp, pizzaId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará este item.",
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
                        Swal.fire('Eliminado!', 'El item ha sido eliminado.', 'success');
                        setGroupedPizzas(prevGroups =>
                            prevGroups.map(group =>
                                group.timestamp === groupTimestamp
                                    ? {...group, pizzas: group.pizzas.filter(pizza => pizza.id !== pizzaId)}
                                    : group
                            )
                        );
                    }
                } catch (error) {
                    Swal.fire('Error', 'Hubo un problema al eliminar el item. Intenta nuevamente.', 'error');
                }
            }
        });
    };

    const handleAddPizza = async (groupTimestamp, clientId) => {
        const pizzaName = newPizza.type === 'Otra' ? newPizza.customName : newPizza.type;
        const newPizzaData = {content: pizzaName, timestamp: groupTimestamp, person_id: clientId}; // Agrega clientId aquí
        console.log(newPizzaData);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/pizzas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPizzaData)
            });

            if (response.ok) {
                const createdPizza = await response.json();
                setGroupedPizzas(prevGroups =>
                    prevGroups.map(group =>
                        group.timestamp === groupTimestamp
                            ? {...group, pizzas: [...group.pizzas, createdPizza]}
                            : group
                    )
                );
                setNewPizza({type: '', customName: ''});
                Swal.fire('Añadido!', 'La pizza ha sido añadida.', 'success');
            } else {
                Swal.fire('Error', 'No se pudo añadir la pizza. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al añadir la pizza. Intenta nuevamente.', 'error');
        }
    };

    const filteredGroupedPizzas = groupedPizzas.filter(group => {
    const clientName = `${group.pizzas[0]?.client?.fname} ${group.pizzas[0]?.client?.lname}`.toLowerCase();
    const matchesClient = clientFilter ? clientName.includes(clientFilter.toLowerCase()) : true;

    // Formato de fecha para que coincida solo con la parte de la fecha (YYYY-MM-DD)
    const groupDate = group.timestamp.split(' ')[0];  // Solo toma la fecha, ignora la hora
    const matchesDate = dateFilter ? groupDate === dateFilter : true;

    return matchesClient && matchesDate;
});

const saveGroupDateChange = async (group) => {
    const newDateTime = dateEdits[group.timestamp];

    if (!newDateTime) {
        Swal.fire('Error', 'Por favor, selecciona una nueva fecha y hora.', 'error');
        return;
    }

    // Formatear la fecha a 'YYYY-MM-DD HH:MM'
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const formattedDate = formatDate(newDateTime);

    // Actualizar la fecha para cada pizza en el grupo
    const updatePromises = group.pizzas.map(async (pizza) => {
        const updatedPizza = {
            id: pizza.id,
            timestamp: formattedDate,
            content: pizza.content
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pizzas/${pizza.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPizza)
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar la pizza ${pizza.id}`);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', `No se pudo actualizar la pizza ${pizza.id}.`, 'error');
        }
    });

    await Promise.all(updatePromises);

    // Actualizar el estado de groupedPizzas para reflejar el cambio sin recargar
    setGroupedPizzas(prevGroups =>
        prevGroups.map(g =>
            g.timestamp === group.timestamp
                ? { ...g, timestamp: formattedDate, pizzas: g.pizzas.map(pizza => ({ ...pizza, timestamp: formattedDate })) }
                : g
        )
    );

    Swal.fire('Éxito', 'La fecha del grupo se ha actualizado.', 'success');
    setDateEdits(prevState => ({ ...prevState, [group.timestamp]: '' }));
    setIsEditingDate(prevState => ({ ...prevState, [group.timestamp]: false }));
};


const handleGroupDateChange = (e, timestamp) => {
        const { value } = e.target;
        setDateEdits(prevState => ({
            ...prevState,
            [timestamp]: value // Almacena la nueva fecha seleccionada para el grupo
        }));
    };

    return (
        <div className="ListadoClientes">
            <Container sx={{paddingY: '20px'}}>
                <Typography variant="h2" align="center" gutterBottom sx={{color: '#0a9fdd', fontWeight: 'bold'}}>
                    Pedidos
                </Typography>
                <Box display="flex" gap={2} mb={3}>
                    <TextField
                        label="Buscar por cliente"
                        variant="outlined"
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)} // Actualiza el estado al escribir
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        label="Buscar por fecha"
                        type="date"
                        variant="outlined"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        sx={{ flex: 1 }}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                </Box>



                        {filteredGroupedPizzas.map(group => (
                    <Box key={group.timestamp} mb={4} sx={{ padding: '20px', borderRadius: '10px', boxShadow: 3, backgroundColor: '#f5f5f5' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Fecha: {new Date(group.timestamp).toLocaleString()} {/* Muestra fecha y hora */}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                 <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                    setIsEditingDate(prevState => ({
                                        ...prevState,
                                        [group.timestamp]: !prevState[group.timestamp]
                                    }))
                                }
                            >
                                {isEditingDate[group.timestamp] ? "Cancelar" : "Editar Fecha"}
                            </Button>
                                {isEditingDate[group.timestamp] && (
                            <Box display="flex" alignItems="center" gap={2} mt={2}>
                                <TextField
                                    label="Nueva Fecha y Hora"
                                    type="datetime-local"
                                    value={dateEdits[group.timestamp] || ''}
                                    onChange={(e) => handleGroupDateChange(e, group.timestamp)}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button variant="contained" color="primary" onClick={() => saveGroupDateChange(group)}>
                                    Guardar Fecha y Hora
                                </Button>
                            </Box>
                        )}
                                  <Button variant="outlined" color="error" onClick={() => handleDeleteGroup(group)}>
                                Borrar pedido
                            </Button>
                            </Box>


                        </Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: '10px', color: '#666' }}>
                            Cliente: {group.pizzas.length > 0 && `${group.pizzas[0].client.fname} ${group.pizzas[0].client.lname}`}
                        </Typography>
                        <List>
                            {group.pizzas.map(pizza => (
                                <ListItem key={pizza.id} sx={{padding: 0}}>
                                    <Paper sx={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '16px',
                                        marginBottom: '10px',
                                        borderRadius: '8px'
                                    }}>
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
                                                        sx={{marginRight: '20px'}}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{color: '#333'}}>
                                                        Id-Pizza: {pizza.id} {pizza.content}
                                                    </Typography>
                                                )
                                            }
                                        />
                                        {editedPizzas[group.timestamp]?.[pizza.id] ? (
                                            <>
                                                <Button variant="contained" color="primary" sx={{marginRight: '10px'}}
                                                        onClick={() => handleSave(group.timestamp, pizza.id)}>
                                                    Guardar
                                                </Button>
                                                <Button variant="outlined" color="secondary"
                                                        onClick={() => handleCancelEdit(group.timestamp, pizza.id)}>
                                                    Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outlined" color="primary" sx={{marginRight: '10px'}}
                                                        onClick={() => setEditedPizzas(prev => ({
                                                            ...prev,
                                                            [group.timestamp]: {
                                                                ...prev[group.timestamp],
                                                                [pizza.id]: pizza
                                                            }
                                                        }))}>
                                                    Editar
                                                </Button>
                                                <IconButton
                                                    onClick={() => handleDeletePizza(group.timestamp, pizza.id)}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </>
                                        )}
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                        <Box display="flex" alignItems="center" mt={2}>
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel>Tipo de pizza</InputLabel>
                                <Select
                                    label="Tipo de pizza"
                                    value={newPizza.type}
                                    onChange={(e) => setNewPizza({type: e.target.value, customName: ''})}
                                >
                                    <MenuItem value="" disabled>Seleccionar Pizza</MenuItem>
                                    <MenuItem value="Cuatro Quesos">Cuatro Quesos</MenuItem>
                                    <MenuItem value="Especial">Especial</MenuItem>
                                    <MenuItem value="Margherita">Margherita</MenuItem>
                                    <MenuItem value="Muzzarella">Muzzarella</MenuItem>
                                    <MenuItem value="Pepperoni">Pepperoni</MenuItem>
                                    <MenuItem value="Otra">Otra</MenuItem>
                                </Select>
                            </FormControl>
                            {newPizza.type === 'Otra' && (
                                <TextField
                                    label="Nombre personalizado"
                                    value={newPizza.customName}
                                    onChange={(e) => setNewPizza(prev => ({...prev, customName: e.target.value}))}
                                    variant="outlined"
                                    fullWidth
                                    sx={{marginLeft: '10px'}}
                                />
                            )}
                            <IconButton
                                color="primary"
                                onClick={() => handleAddPizza(group.timestamp, group.pizzas[0].client.id)} // Agrega client.id aquí
                            >
                                <AddIcon/>
                            </IconButton>

                        </Box>
                    </Box>
                ))}
            </Container>
        </div>
    );
};

export default GroupedPizzas;
