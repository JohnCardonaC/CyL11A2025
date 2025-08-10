'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import ImportButton from '../components/ImportButton';

// ====================================================================
// ÍCONOS SVG
// ====================================================================
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6B7280' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const ColumnsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4B5563' }}><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg> );
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const ChevronLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

// Interfaces
interface Veedor { id: number; nodo: string | null; departamento: string | null; "Cod_Ciudad": number | null; "COD CYL": number | null; ppal: string | null; ciudad: string | null; "Cod_Sitio": string | null; "Fecha aplica": string | null; hora: string | null; sitio: string | null; direccion: string | null; barrio: string | null; salones: number | null; "CITADOS 10": number | null; contrato: string | null; capacita: string | null; nombres: string | null; apellidos: string | null; cedula: string | null; celular: string | null; correo: string | null; banco: string | null; "Tipo Cuenta": string | null; "No. Cuenta": string | null; createdAt: string | null; A: boolean | null; B: boolean | null; C: boolean | null; D: boolean | null; E: boolean | null; F: boolean | null; }
type RawVeedorData = { [key: string]: string | number; };

// Definición de todas las columnas de la tabla
const allColumns = [
  { key: 'nodo', label: 'NODO' },
  { key: 'departamento', label: 'DEPARTAMENTO' },
  { key: 'Cod_Ciudad', label: 'Cod_Ciudad' },
  { key: 'COD CYL', label: 'COD CYL' },
  { key: 'ppal', label: 'Ppal' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'Cod_Sitio', label: 'Cod_Sitio' },
  { key: 'Fecha aplica', label: 'Fecha aplica' },
  { key: 'hora', label: 'Hora' },
  { key: 'sitio', label: 'Sitio' },
  { key: 'direccion', label: 'Direccion' },
  { key: 'barrio', label: 'Barrio' },
  { key: 'salones', label: 'SALONES' },
  { key: 'CITADOS 10', label: 'CITADOS 10' },
  { key: 'contrato', label: 'Contrato' },
  { key: 'capacita', label: 'CAPACITA' },
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'cedula', label: 'Cedula' },
  { key: 'celular', label: 'Celular' },
  { key: 'correo', label: 'Correo' },
  { key: 'banco', label: 'Banco' },
  { key: 'Tipo Cuenta', label: 'Tipo Cuenta' },
  { key: 'No. Cuenta', label: 'No. Cuenta' },
  { key: 'A', label: 'Llegada sitio Mañana' },
  { key: 'B', label: 'Entrega material mañana' },
  { key: 'C', label: 'Finalizó mañana' },
  { key: 'D', label: 'Llegada sitio tarde' },
  { key: 'E', label: 'Entrega material tarde' },
  { key: 'F', label: 'Finalizó tarde' },
];

const formatDisplayDate = (dateString: string | null | undefined) => { if (!dateString) return '-'; const date = new Date(dateString); return date.toLocaleDateString('es-CO', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }); };

export default function VeedoresPage() {
  const [veedores, setVeedores] = useState<Veedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Estado para el control de columnas
  const initialVisibleColumns = allColumns.map(col => col.key);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialVisibleColumns);
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);

  // Estado para los filtros
  const [searchCodSitio, setSearchCodSitio] = useState<string>('');
  const [searchCiudad, setSearchCiudad] = useState<string>('');
  const [searchDepartamento, setSearchDepartamento] = useState<string>('');
  const [searchCodCiudad, setSearchCodCiudad] = useState<string>('');
  const [searchSitio, setSearchSitio] = useState<string>('');
  const [filterA, setFilterA] = useState<boolean>(false);
  const [filterB, setFilterB] = useState<boolean>(false);
  const [filterC, setFilterC] = useState<boolean>(false);
  const [filterD, setFilterD] = useState<boolean>(false);
  const [filterE, setFilterE] = useState<boolean>(false);
  const [filterF, setFilterF] = useState<boolean>(false);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  
  // Estado para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVeedor, setEditingVeedor] = useState<Partial<Veedor> | null>(null);
  const [editFeedback, setEditFeedback] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVeedor, setNewVeedor] = useState<Partial<Veedor>>({});
  const [addFeedback, setAddFeedback] = useState('');


  // Función para obtener veedores con filtros y paginación
  const obtenerVeedores = async (
    filters: {
      codSitio?: string;
      ciudad?: string;
      departamento?: string;
      codCiudad?: string;
      sitio?: string;
      A?: boolean;
      B?: boolean;
      C?: boolean;
      D?: boolean;
      E?: boolean;
      F?: boolean;
    } = {},
    page: number = 0
  ) => {
    setLoading(true);
    setError(null);

    let query = supabase.from('veedores').select('*', { count: 'exact' });

    if (filters.codSitio) {
      query = query.ilike('Cod_Sitio', `%${filters.codSitio}%`);
    }
    if (filters.ciudad) {
      query = query.ilike('ciudad', `%${filters.ciudad}%`);
    }
    if (filters.departamento) {
      query = query.ilike('departamento', `%${filters.departamento}%`);
    }
    if (filters.codCiudad) {
      query = query.ilike('Cod_Ciudad', `%${filters.codCiudad}%`);
    }
    if (filters.sitio) {
      query = query.ilike('sitio', `%${filters.sitio}%`);
    }
    if (filters.A) {
      query = query.eq('A', true);
    }
    if (filters.B) {
      query = query.eq('B', true);
    }
    if (filters.C) {
      query = query.eq('C', true);
    }
    if (filters.D) {
      query = query.eq('D', true);
    }
    if (filters.E) {
      query = query.eq('E', true);
    }
    if (filters.F) {
      query = query.eq('F', true);
    }

    if (itemsPerPage !== -1) {
      const from = page * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }
    
    query = query.order('id', { ascending: true });

    const { data, error, count } = await query;
    if (error) {
      setError("Error al cargar datos: " + error.message);
    } else {
      setVeedores(data as Veedor[]);
      setTotalRecords(count);
      setHasMorePages(data.length === itemsPerPage);
    }
    setLoading(false);
  };
  
  // Llama a la función de obtención de datos al cargar la página
  useEffect(() => {
    obtenerVeedores({}, currentPage);
  }, [currentPage, itemsPerPage]);

  // UseEffect para el filtrado dinámico en el servidor
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(0); // Reiniciar la página al aplicar un filtro
      obtenerVeedores({
        codSitio: searchCodSitio,
        ciudad: searchCiudad,
        departamento: searchDepartamento,
        codCiudad: searchCodCiudad,
        sitio: searchSitio,
        A: filterA,
        B: filterB,
        C: filterC,
        D: filterD,
        E: filterE,
        F: filterF,
      }, 0);
    }, 500); // Debounce de 500ms para evitar múltiples llamadas a la API al escribir

    return () => clearTimeout(delayDebounceFn);
  }, [searchCodSitio, searchCiudad, searchDepartamento, searchCodCiudad, searchSitio, filterA, filterB, filterC, filterD, filterE, filterF]);


  const handleSelectRow = (id: number) => { setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]); };
  const handleSelectAll = () => { setSelectedRows(selectedRows.length === veedores.length ? [] : veedores.map(v => v.id)); };
  
  const handleDeleteSelected = async () => { 
    if (selectedRows.length === 0) return; 
    const confirmDelete = window.confirm(`¿Seguro que quieres eliminar ${selectedRows.length} registro(s)?`); 
    if (confirmDelete) { 
      setLoading(true); 
      const { error } = await supabase.from('veedores').delete().in('id', selectedRows); 
      if (error) { 
        setError("Error al eliminar: " + error.message); 
      } else { 
        await obtenerVeedores(); 
        setSelectedRows([]); 
      } 
      setLoading(false); 
    } 
  };

  // Función para eliminar una fila individual
  const handleDeleteRow = async (id: number) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar este registro?`);
    if (confirmDelete) {
      setLoading(true);
      const { error } = await supabase.from('veedores').delete().eq('id', id);
      if (error) {
        setError("Error al eliminar: " + error.message);
      } else {
        await obtenerVeedores();
      }
      setLoading(false);
    }
  };

  // Función para el botón de editar
  const handleEditRow = (veedor: Veedor) => {
    setEditingVeedor(veedor);
    setIsEditModalOpen(true);
    setEditFeedback('');
  };

  // Manejador de cambios en los campos del modal de edición
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Special handling for checkbox types
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEditingVeedor(prev => (prev ? { ...prev, [name]: newValue } : null));
  };

  // Manejador del envío del formulario de edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVeedor || !editingVeedor.id) return;

    setLoading(true);
    setEditFeedback('Actualizando registro...');

    const { error } = await supabase
      .from('veedores')
      .update(editingVeedor)
      .eq('id', editingVeedor.id);

    if (error) {
      setEditFeedback(`Error al actualizar: ${error.message}`);
      setError("Error al actualizar: " + error.message);
    } else {
      setEditFeedback('Registro actualizado con éxito!');
      await obtenerVeedores(); // Recargar los datos
      setTimeout(() => setIsEditModalOpen(false), 1500); // Cerrar modal después de un tiempo
    }
    setLoading(false);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setEditingVeedor(null); setEditFeedback(''); };

  // Manejador para el checkbox de columnas
  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };
  
  // Manejador para los checkboxes de las columnas A, B, C, D, E, F
  const handleCheckboxChange = async (id: number, key: keyof Veedor, value: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('veedores')
      .update({ [key]: value })
      .eq('id', id);

    if (error) {
      setError(`Error al actualizar el campo ${key}: ${error.message}`);
    } else {
      // Actualizar el estado local para reflejar el cambio inmediatamente
      setVeedores(prevVeedores =>
        prevVeedores.map(veedor =>
          veedor.id === id ? { ...veedor, [key]: value } : veedor
        )
      );
    }
    setLoading(false);
  };

  // Lógica para el modal de agregar
  const handleAddModalOpen = () => {
    setIsAddModalOpen(true);
    setNewVeedor({}); // Limpiar el formulario
    setAddFeedback('');
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };
  const handleNewVeedorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setNewVeedor(prev => ({ ...prev, [name]: newValue }));
  };
  const handleAgregarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAddFeedback('Creando nuevo registro...');

    const { error } = await supabase
      .from('veedores')
      .insert([newVeedor]);

    if (error) {
      setAddFeedback(`Error al crear el registro: ${error.message}`);
      setError("Error al crear el registro: " + error.message);
    } else {
      setAddFeedback('Registro creado con éxito!');
      await obtenerVeedores();
      setTimeout(() => setIsAddModalOpen(false), 1500);
    }
    setLoading(false);
  };

  const handleNextPage = () => {
    if (hasMorePages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const isAnyFilterActive = searchCodSitio || searchCiudad || searchDepartamento || searchCodCiudad || searchSitio || filterA || filterB || filterC || filterD || filterE || filterF;
  const showPagination = !isAnyFilterActive && itemsPerPage !== -1;

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  const booleanColumns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const booleanFilterStates = {
    A: filterA, B: filterB, C: filterC, D: filterD, E: filterE, F: filterF
  };
  const setBooleanFilterStates = {
    A: setFilterA, B: setFilterB, C: setFilterC, D: setFilterD, E: setFilterE, F: setFilterF
  };
  const getLabelForBooleanFilter = (key: string) => {
    switch (key) {
      case 'A': return 'Llegada sitio Mañana';
      case 'B': return 'Entrega material mañana';
      case 'C': return 'Finalizó mañana';
      case 'D': return 'Llegada sitio tarde';
      case 'E': return 'Entrega material tarde';
      case 'F': return 'Finalizó tarde';
      default: return '';
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <Image src="/logo.jpg" alt="Logo" width={250} height={80} priority />
          <h1 style={styles.title}>Pruebas ICFES 11A 2025</h1>
        </header>
        <div style={styles.toolbarContainer}>
          <div style={styles.searchFilterContainer}>
            <div style={styles.searchContainer}>
              <SearchIcon />
              <input type="text" placeholder="Buscar por Cod_Sitio..." value={searchCodSitio} onChange={(e) => setSearchCodSitio(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.searchContainer}>
              <SearchIcon />
              <input type="text" placeholder="Buscar por Sitio..." value={searchSitio} onChange={(e) => setSearchSitio(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.searchContainer}>
              <SearchIcon />
              <input type="text" placeholder="Buscar por Ciudad..." value={searchCiudad} onChange={(e) => setSearchCiudad(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.searchContainer}>
              <SearchIcon />
              <input type="text" placeholder="Buscar por Departamento..." value={searchDepartamento} onChange={(e) => setSearchDepartamento(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.searchContainer}>
              <SearchIcon />
              <input type="text" placeholder="Buscar por Cod_Ciudad..." value={searchCodCiudad} onChange={(e) => setSearchCodCiudad(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.filterCheckboxContainer}>
              {booleanColumns.map(key => (
                <label key={key} style={styles.filterCheckboxLabel}>
                  <input type="checkbox" checked={booleanFilterStates[key as keyof typeof booleanFilterStates]} onChange={(e) => setBooleanFilterStates[key as keyof typeof booleanFilterStates](e.target.checked)} />
                  {getLabelForBooleanFilter(key)}
                </label>
              ))}
            </div>
          </div>
          <div style={styles.actionsContainer}>
            <button onClick={handleAddModalOpen} style={styles.addButton}>
              <PlusIcon />
              Agregar
            </button>
            <div style={styles.columnsDropdownContainer}>
              <button onClick={() => setIsColumnsDropdownOpen(!isColumnsDropdownOpen)} style={styles.columnsDropdownButton}>
                <ColumnsIcon />
                Columnas
              </button>
              {isColumnsDropdownOpen && (
                <div style={styles.columnsDropdownMenu}>
                  {allColumns.map(col => (
                    <label key={col.key} style={styles.columnsDropdownItem}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => handleColumnToggle(col.key)}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <ImportButton onImportSuccess={obtenerVeedores} />
            <button onClick={handleDeleteSelected} disabled={selectedRows.length === 0} style={selectedRows.length > 0 ? styles.deleteButton : { ...styles.deleteButton, ...styles.deleteButtonDisabled }}>
              <TrashIcon />
              Eliminar ({selectedRows.length})
            </button>
          </div>
        </div>
        {loading && <p>Cargando datos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4B5563' }}>
              <span>Registros: {totalRecords}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Registros por página:</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} style={styles.selectInput}>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                  <option value="-1">Todos</option>
                </select>
              </div>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={styles.th}><input type="checkbox" checked={veedores.length > 0 && selectedRows.length === veedores.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} /></th>
                    <th style={styles.th}>No.</th>
                    {visibleColumns.map(key => {
                      const column = allColumns.find(col => col.key === key);
                      return <th key={key} style={styles.th}>{column?.label}</th>;
                    })}
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {veedores.map((veedor, index) => (
                    <tr key={veedor.id} style={{ ...styles.tr, backgroundColor: selectedRows.includes(veedor.id) ? '#E0E7FF' : (hoveredRowId === veedor.id ? '#F9FAFB' : 'transparent') }} onMouseEnter={() => setHoveredRowId(veedor.id)} onMouseLeave={() => setHoveredRowId(null)}>
                      <td style={styles.td}><input type="checkbox" checked={selectedRows.includes(veedor.id)} onChange={() => handleSelectRow(veedor.id)} style={{ cursor: 'pointer' }} /></td>
                      <td style={styles.td}>{itemsPerPage === -1 ? (index + 1) : (currentPage * itemsPerPage + index + 1)}</td>
                      {visibleColumns.map(key => {
                          // Lógica especial para las columnas booleanas
                          if (booleanColumns.includes(key)) {
                            return (
                              <td key={key} style={{...styles.td, textAlign: 'center'}}>
                                  <input
                                    type="checkbox"
                                    checked={veedor[key as keyof Veedor] as boolean}
                                    onChange={(e) => handleCheckboxChange(veedor.id, key as keyof Veedor, e.target.checked)}
                                    disabled={loading}
                                  />
                              </td>
                            );
                          }
                          // Lógica para las demás columnas
                          return <td key={key} style={styles.td}>{veedor[key as keyof Veedor] || '-'}</td>;
                      })}
                      <td style={styles.td}>
                        <div style={styles.actionsCell}>
                          <button onClick={() => handleEditRow(veedor)} style={styles.actionButton}>
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDeleteRow(veedor.id)} style={styles.actionButton}>
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Controles de paginación */}
            {showPagination && (
              <div style={styles.paginationContainer}>
                <button onClick={handlePrevPage} disabled={currentPage === 0 || loading} style={currentPage === 0 || loading ? {...styles.paginationButton, opacity: 0.5, cursor: 'not-allowed'} : styles.paginationButton}>
                  <ChevronLeftIcon />
                  Anterior
                </button>
                <span style={styles.pageNumber}>Página {currentPage + 1} de {totalRecords && itemsPerPage && Math.ceil(totalRecords / itemsPerPage)}</span>
                <button onClick={handleNextPage} disabled={!hasMorePages || loading} style={!hasMorePages || loading ? {...styles.paginationButton, opacity: 0.5, cursor: 'not-allowed'} : styles.paginationButton}>
                  Siguiente
                  <ChevronRightIcon />
                </button>
              </div>
            )}
          </>
        )}

      {/* Modal de edición */}
      {isEditModalOpen && editingVeedor && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Editar Veedor</h2>
              <button onClick={closeEditModal} style={styles.closeButton}><CloseIcon /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {allColumns.filter(col => col.key !== 'id' && col.key !== 'createdAt').map(col => {
                const key = col.key as keyof Veedor;
                const isBoolean = booleanColumns.includes(key);
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor={key} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{col.label}</label>
                    {isBoolean ? (
                      <input
                        id={key}
                        name={key}
                        type="checkbox"
                        checked={!!editingVeedor[key]}
                        onChange={handleEditChange}
                        style={{ width: 'auto' }}
                        disabled={loading}
                      />
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type="text"
                        value={String(editingVeedor[key] || '')}
                        onChange={handleEditChange}
                        style={styles.editInput}
                        disabled={key === 'createdAt' || loading}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={closeEditModal} style={styles.cancelButton} disabled={loading}>Cancelar</button>
                <button type="submit" style={loading ? {...styles.confirmButton, opacity: 0.7, cursor: 'wait'} : styles.confirmButton} disabled={loading}>
                  {loading ? 'Guardando...' : <><SaveIcon /> Guardar Cambios</>}
                </button>
              </div>
            </form>
            {editFeedback && <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 500, color: editFeedback.startsWith('Error') ? '#DC2626' : '#16A34A' }}>{editFeedback}</p>}
          </div>
        </div>
      )}

      {/* Modal de agregar */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Agregar Veedor</h2>
              <button onClick={closeAddModal} style={styles.closeButton}><CloseIcon /></button>
            </div>
            <form onSubmit={handleAgregarSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {allColumns.filter(col => col.key !== 'id' && col.key !== 'createdAt').map(col => {
                const key = col.key as keyof Veedor;
                const isBoolean = booleanColumns.includes(key);
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor={key} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{col.label}</label>
                    {isBoolean ? (
                      <input
                        id={key}
                        name={key}
                        type="checkbox"
                        checked={!!newVeedor[key]}
                        onChange={handleNewVeedorChange}
                        style={{ width: 'auto' }}
                        disabled={loading}
                      />
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type="text"
                        value={String(newVeedor[key] || '')}
                        onChange={handleNewVeedorChange}
                        style={styles.editInput}
                        disabled={loading}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={closeAddModal} style={styles.cancelButton} disabled={loading}>Cancelar</button>
                <button type="submit" style={loading ? {...styles.confirmButton, opacity: 0.7, cursor: 'wait'} : styles.confirmButton} disabled={loading}>
                  {loading ? 'Agregando...' : <><PlusIcon /> Agregar Veedor</>}
                </button>
              </div>
            </form>
            {addFeedback && <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 500, color: addFeedback.startsWith('Error') ? '#DC2626' : '#16A34A' }}>{addFeedback}</p>}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

// ====================================================================
// ESTILOS MODERNOS (CON CAMBIOS DE COLOR)
// ====================================================================
const styles: { [key: string]: React.CSSProperties } = {
    main: { backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
    container: { maxWidth: '95%', margin: '0 auto' },
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' },
    title: { fontSize: '2rem', color: '#111827', margin: 0, textAlign: 'center', fontWeight: 700 },
    toolbarContainer: { marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    searchFilterContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
    searchContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', flex: 1, minWidth: '200px' },
    searchInput: { border: 'none', outline: 'none', padding: '0', fontSize: '1rem', width: '100%', color: '#111827' },
    actionsContainer: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
    tableContainer: { overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '0.75rem', backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    trHeader: { borderBottom: '1px solid #E5E7EB' },
    th: { padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', fontSize: '0.75rem', minWidth: '100px', whiteSpace: 'normal', verticalAlign: 'bottom' },
    td: { padding: '0.75rem 0.5rem', borderTop: '1px solid #E5E7EB', color: '#374151', fontSize: '0.875rem', minWidth: '100px' },
    tr: { transition: 'background-color 0.2s ease-in-out' },
    deleteButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#EF4444', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s, opacity 0.2s', },
    deleteButtonDisabled: { backgroundColor: '#9CA3AF', cursor: 'not-allowed', opacity: 0.6 },
    importButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #3B82F6', borderRadius: '0.375rem', backgroundColor: 'white', color: '#3B82F6', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' },
    addButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #16A34A', borderRadius: '0.375rem', backgroundColor: '#ECFDF5', color: '#16A34A', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' },
    
    // -- NUEVOS ESTILOS PARA PAGINACIÓN Y FILTROS --
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
    paginationButton: { padding: '0.5rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    pageNumber: { fontSize: '1rem', fontWeight: 600, color: '#374151' },
    selectInput: { padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer', color: '#4B5563' },
    filterCheckboxContainer: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' },
    filterCheckboxLabel: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#111827' },
    
    // -- ESTILOS DE DROPDOWN Y MODAL --
    columnsDropdownContainer: { position: 'relative', display: 'inline-block' },
    columnsDropdownButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', color: '#4B5563', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s', },
    columnsDropdownMenu: { position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', zIndex: 50, padding: '0.5rem' },
    columnsDropdownItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#111827' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    modalTitle: { color: '#111827', margin: 0 },
    modalSubtext: { color: '#374151', marginTop: 0, marginBottom: '1.5rem' },
    closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#6B7280' },
    dropzone: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', border: '2px dashed #D1D5DB', borderRadius: '0.5rem', backgroundColor: '#F9FAFB', textAlign: 'center', color: '#374151', cursor: 'pointer', transition: 'border-color 0.2s' },
    filePreview: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', color: '#111827' },
    removeFileButton: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' },
    cancelButton: { padding: '0.625rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#374151' },
    confirmButton: { padding: '0.625rem 1.25rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    actionsCell: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
    actionButton: { background: 'none', border: '1px solid #D1D5DB', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', color: '#6B7280', transition: 'background-color 0.2s', },
    editInput: { padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', transition: 'border-color 0.2s', color: '#111827' },
};