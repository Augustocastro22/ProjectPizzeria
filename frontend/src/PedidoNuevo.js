import React, {useState} from 'react';
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
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PedidoNuevo = () => {
    const [cliente, setCliente] = useState({dni: '', nombre: '', apellido: ''});
    const [carrito, setCarrito] = useState([]);
    const [pizza, setPizza] = useState('');
    const [customPizza, setCustomPizza] = useState(''); // Nuevo estado para pizza personalizada

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCliente((prev) => ({...prev, [name]: value}));
    };

    const handleDniBlur = () => {
        fetchCliente(cliente.dni);
    };

    const fetchCliente = async (dni) => {
        if (!dni) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/people/dni/${dni}`);
            if (response.ok) {
                const data = await response.json();
                setCliente({dni: data.dni, nombre: data.fname, apellido: data.lname, id: data.id});
            } else {
                console.error('Cliente no encontrado o error en la API');
                setCliente((prev) => ({...prev, nombre: '', apellido: '', id: ''}));
            }
        } catch (error) {
            console.error('Error al cargar el cliente:', error);
        }
    };

    const handleAddPizza = () => {
        const pizzaName = pizza === 'Otra' ? customPizza : pizza;
        if (pizzaName) {
            const newPizza = {id: Date.now(), name: pizzaName};
            setCarrito([...carrito, newPizza]);
            setPizza('');
            setCustomPizza(''); // Limpiar el campo personalizado
        }
    };

    const handleRemovePizza = (id) => {
        setCarrito(carrito.filter((pizza) => pizza.id !== id));
    };

    const handleRealizarPedido = async () => {
        if (!cliente.dni || !cliente.nombre || !cliente.apellido) {
            alert('Por favor, complete la información del cliente.');
            return;
        }

        if (carrito.length === 0) {
            alert('El carrito está vacío. Agregue al menos una pizza.');
            return;
        }

        const personId = cliente.id;

        for (let pizza of carrito) {
            const pizzaData = {
                person_id: personId,
                content: pizza.name,
            };

            try {
                const response = await fetch('http://127.0.0.1:8000/api/create_pizza', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pizzaData),
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(`Error al agregar pizza: ${error.message}`);
                    return;
                }
            } catch (error) {
                alert('Error al realizar el pedido');
                console.error('Error:', error);
                return;
            }
        }

        alert('Pedido realizado exitosamente');

        setCliente({dni: '', nombre: '', apellido: ''});
        setCarrito([]);
    };

    const handleGuardarCliente = async () => {
        if (!cliente.dni || !cliente.nombre || !cliente.apellido) {
            alert('Por favor, complete la información del cliente.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/create_people', {
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
                setCliente((prev) => ({...prev, id: data.id})); // Asigna el id del cliente recién creado
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
                onBlur={handleDniBlur}
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
                style={{marginTop: '16px'}}
                disabled={!!cliente.id} // Deshabilita si el cliente ya tiene un ID asignado
            >
                Guardar Cliente
            </Button>


            <Typography variant="h6" style={{marginTop: '32px'}}>Agregar Pizzas al Carrito</Typography>
            <Select
                value={pizza}
                onChange={(e) => setPizza(e.target.value)}
                fullWidth
                displayEmpty
                margin="normal"
                variant="outlined"
            >
                <MenuItem value="" disabled>Seleccionar Pizza</MenuItem>
                <MenuItem value="Cuatro Quesos">Cuatro Quesos</MenuItem>
                <MenuItem value="Especial">Especial</MenuItem>
                <MenuItem value="Margherita">Margherita</MenuItem>
                <MenuItem value="Muzzarella">Muzzarella</MenuItem>
                <MenuItem value="Pepperoni">Pepperoni</MenuItem>
                <MenuItem value="Otra">Otra</MenuItem> {/* Opción de pizza personalizada */}
            </Select>
            {pizza === 'Otra' && (
                <TextField
                    label="Escribe el nombre de tu pizza"
                    value={customPizza}
                    onChange={(e) => setCustomPizza(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                />
            )}
            <Button
                variant="contained"
                color="secondary"
                onClick={handleAddPizza}
                style={{marginTop: '16px'}}
                disabled={!cliente.id} // Deshabilita si el cliente no tiene un ID
            >
                Agregar Pizza
            </Button>


            <Typography variant="h6" style={{marginTop: '32px'}}>Carrito</Typography>
            <List>
                {carrito.map((pizza) => (
                    <ListItem key={pizza.id}>
                        <ListItemText primary={pizza.name}/>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePizza(pizza.id)}>
                            <DeleteIcon/>
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            <Button
                variant="contained"
                color="success"
                onClick={handleRealizarPedido}
                style={{marginTop: '16px'}}
                disabled={!cliente.id} // Deshabilita si el cliente no tiene un ID
            >
                Realizar Pedido
            </Button>

        </Container>
    );
};

export default PedidoNuevo;
