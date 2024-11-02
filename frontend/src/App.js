import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';

function App() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Hacer una solicitud al backend para obtener los clientes
    fetch('/api/clientes')
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lista de Clientes</h1>
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente.id}>{cliente.name}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
