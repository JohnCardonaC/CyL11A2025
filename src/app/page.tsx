'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importamos nuestro cliente

// Asumimos que cada fila de tu Excel tiene esta estructura. ¡Ajústala!
interface Registro {
  id: number;
  nombre_producto: string; // Ejemplo de columna
  categoria: string;      // Ejemplo de columna
  cantidad: number;         // Ejemplo de columna
}

export default function Home() {
  const [datos, setDatos] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los valores de los buscadores
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaCategoria, setBusquedaCategoria] = useState('');

  // Función para obtener los datos de Supabase
  const obtenerDatos = async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from('registros_excel').select('*'); // Usa el nombre de tu tabla

    // Aplicar filtros si los buscadores tienen texto
    if (busquedaProducto) {
      // 'ilike' busca un patrón sin importar mayúsculas/minúsculas
      query = query.ilike('nombre_producto', `%${busquedaProducto}%`); // Usa el nombre de tu columna
    }
    if (busquedaCategoria) {
      query = query.ilike('categoria', `%${busquedaCategoria}%`); // Usa el nombre de tu columna
    }

    const { data, error } = await query.order('id'); // Ordenamos por ID

    if (error) {
      console.error("Error al obtener datos: ", error);
      setError(error.message);
    } else {
      setDatos(data as Registro[]);
    }
    setLoading(false);
  };

  // Cargar los datos iniciales cuando el componente se monta
  useEffect(() => {
    obtenerDatos();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir recarga de la página
    obtenerDatos();
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h1>Visor de Datos de Excel</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por producto..."
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <input
          type="text"
          placeholder="Buscar por categoría..."
          value={busquedaCategoria}
          onChange={(e) => setBusquedaCategoria(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>Buscar</button>
      </form>

      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Producto</th>
              <th style={tableHeaderStyle}>Categoría</th>
              <th style={tableHeaderStyle}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {datos.length > 0 ? (
              datos.map((registro) => (
                <tr key={registro.id}>
                  <td style={tableCellStyle}>{registro.nombre_producto}</td>
                  <td style={tableCellStyle}>{registro.categoria}</td>
                  <td style={tableCellStyle}>{registro.cantidad}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ ...tableCellStyle, textAlign: 'center' }}>No se encontraron resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}

// Estilos para la tabla
const tableHeaderStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '12px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};
const tableCellStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
};