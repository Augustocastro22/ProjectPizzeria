import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Select,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

const PedidoNuevo = () => {
    const [cliente, setCliente] = useState({ dni: '', nombre: '', apellido: '' });
    const [carrito, setCarrito] = useState([]);
    const [pizza, setPizza] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCliente((prev) => ({ ...prev, [name]: value }));
    };

    const handleDniBlur = () => {
        fetchCliente(cliente.dni);
    };

    const fetchCliente = async (dni) => {
        if (!dni) return;  // No hacer nada si el DNI está vacío

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/people/dni/${dni}`);
            if (response.ok) {
                const data = await response.json();
                setCliente({ dni: data.dni, nombre: data.fname, apellido: data.lname });
            } else {
                console.error('Cliente no encontrado o error en la API');
                // Opcional: Reiniciar el estado del cliente si no se encuentra
                setCliente((prev) => ({ ...prev, nombre: '', apellido: '' }));
            }
        } catch (error) {
            console.error('Error al cargar el cliente:', error);
        }
    };

    const handleAddPizza = () => {
        if (pizza) {
            setCarrito([...carrito, pizza]);
            setPizza('');
        }
    };

    const handleRealizarPedido = () => {
        if (!cliente.dni || !cliente.nombre || !cliente.apellido) {
            alert('Por favor, complete la información del cliente.');
            return;
        }

        if (carrito.length === 0) {
            alert('El carrito está vacío. Agregue al menos una pizza.');
            return;
        }

        const pedido = {
            cliente,
            pizzas: carrito,
        };

        console.log('Pedido realizado:', pedido);
        alert('Pedido realizado exitosamente: ' + JSON.stringify(pedido));

        // Limpiar datos después de realizar el pedido
        setCliente({ dni: '', nombre: '', apellido: '' });
        setCarrito([]);
    };

    const handleGuardarCliente = async () => {
        if (!cliente.dni || !cliente.nombre || !cliente.apellido) {
            alert('Por favor, complete la información del cliente.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/create_people', { // Cambia la URL si es necesario
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dni: cliente.dni,
                    lname: cliente.apellido,
                    fname: cliente.nombre,
                }),
            });

            if (response.ok) {
                const data = await response.json();

            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            alert('Error al guardar el cliente');
            console.error('Error:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Nuevo Pedido</Typography>

            <Typography variant="h6">Información del Cliente</Typography>
            <TextField
                label="DNI"
                name="dni"
                value={cliente.dni}
                onChange={handleChange}
                onBlur={handleDniBlur}  // Agrega onBlur aquí
                fullWidth
                margin="normal"
                variant="outlined"
            />
            <TextField
                label="Nombre"
                name="nombre"
                value={cliente.nombre}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
            />
            <TextField
                label="Apellido"
                name="apellido"
                value={cliente.apellido}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleGuardarCliente}
                style={{ marginTop: '16px' }}
            >
                Guardar Cliente
            </Button>

            <Typography variant="h6" style={{ marginTop: '32px' }}>Agregar Pizzas al Carrito</Typography>
            <Select
                value={pizza}
                onChange={(e) => setPizza(e.target.value)}
                fullWidth
                displayEmpty
                margin="normal"
                variant="outlined"
            >
                <MenuItem value="" disabled>Seleccionar Pizza</MenuItem>
                <MenuItem value="Margherita">Margherita</MenuItem>
                <MenuItem value="Pepperoni">Pepperoni</MenuItem>
                <MenuItem value="Cuatro Quesos">Cuatro Quesos</MenuItem>
            </Select>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleAddPizza}
                style={{ marginTop: '16px' }}
            >
                Agregar Pizza
            </Button>

            <Typography variant="h6" style={{ marginTop: '32px' }}>Carrito</Typography>
            <List>
                {carrito.map((pizza, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={pizza} />
                    </ListItem>
                ))}
            </List>

            <Button
                variant="contained"
                color="success"
                onClick={handleRealizarPedido}
                style={{ marginTop: '16px' }}
            >
                Realizar Pedido
            </Button>
        </Container>
    );
};

export default PedidoNuevo;
