'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// ====================================================================
// ÍCONOS SVG
// ====================================================================
const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9CA3AF' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> );
const FileIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);


// Interfaces
interface Veedor { id: number; nodo: string | null; departamento: string | null; "Cod_Ciudad": number | null; "COD CYL": number | null; ppal: string | null; ciudad: string | null; "Cod_Sitio": string | null; "Fecha aplica": string | null; hora: string | null; sitio: string | null; direccion: string | null; barrio: string | null; salones: number | null; "CITADOS 10": number | null; contrato: string | null; capacita: string | null; nombres: string | null; apellidos: string | null; cedula: string | null; celular: string | null; correo: string | null; banco: string | null; "Tipo Cuenta": string | null; "No. Cuenta": string | null; createdAt: string | null; }
type RawVeedorData = { [key: string]: string | number; };


// ====================================================================
// COMPONENTE DE IMPORTACIÓN (CON ESTILOS AJUSTADOS)
// ====================================================================
const ImportButton = ({ onImportSuccess }: { onImportSuccess: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { setFile(e.target.files[0]); setFeedback(''); } };
  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragging(dragging); };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => { handleDragEvents(e, false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { setFile(e.dataTransfer.files[0]); setFeedback(''); } };
  const parseFile = (file: File): Promise<RawVeedorData[]> => { return new Promise((resolve, reject) => { if (file.name.endsWith('.csv')) { Papa.parse(file, { header: true, skipEmptyLines: true, complete: (result) => resolve(result.data as RawVeedorData[]), error: (err) => reject(err) }); } else if (file.name.endsWith('.xlsx')) { const reader = new FileReader(); reader.onload = (e) => { try { const data = new Uint8Array(e.target?.result as ArrayBuffer); const workbook = XLSX.read(data, { type: 'array' }); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; const json = XLSX.utils.sheet_to_json(worksheet); resolve(json as RawVeedorData[]); } catch (err) { reject(err); } }; reader.onerror = reject; reader.readAsArrayBuffer(file); } else { reject(new Error('Formato no soportado. Usa .csv o .xlsx')); } }); };
  const mapDataToSchema = (data: RawVeedorData[]): Partial<Veedor>[] => { return data.map(row => { let fechaAplica = row['Fecha aplica']; if (typeof fechaAplica === 'number') { fechaAplica = new Date((fechaAplica - 25569) * 86400 * 1000).toISOString().split('T')[0]; } return { nodo: String(row.NODO || ''), departamento: String(row.DEPARTAMENTO || ''), Cod_Ciudad: Number(row['Cod_Ciudad']) || null, "COD CYL": Number(row['COD CYL']) || null, ppal: String(row.Ppal || ''), ciudad: String(row.Ciudad || ''), "Cod_Sitio": String(row['Cod_Sitio'] || ''), "Fecha aplica": fechaAplica ? String(fechaAplica) : null, hora: String(row.Hora || ''), sitio: String(row.Sitio || ''), direccion: String(row.Direccion || ''), barrio: String(row.Barrio || ''), salones: Number(row.SALONES) || null, "CITADOS 10": Number(row['CITADOS 10']) || null, contrato: String(row.Contrato || ''), capacita: String(row.CAPACITA || ''), nombres: String(row.Nombres || ''), apellidos: String(row.Apellidos || ''), cedula: String(row.Cedula || ''), celular: String(row.Celular || ''), correo: String(row.Correo || ''), banco: String(row.Banco || ''), "Tipo Cuenta": String(row['Tipo Cuenta'] || ''), "No. Cuenta": String(row['No. Cuenta'] || ''), }; }); };
  const handleImport = async () => { if (!file) { setFeedback('Por favor, selecciona un archivo primero.'); return; } setIsProcessing(true); setFeedback('Procesando archivo...'); try { const data = await parseFile(file); setFeedback('Archivo leído. Mapeando columnas...'); const mappedData = mapDataToSchema(data); setFeedback(`Datos mapeados. Subiendo ${mappedData.length} registros...`); const BATCH_SIZE = 100; for (let i = 0; i < mappedData.length; i += BATCH_SIZE) { const batch = mappedData.slice(i, i + BATCH_SIZE); const { error } = await supabase.from('veedores').insert(batch); if (error) throw new Error(`Error en Supabase: ${error.message}`); setFeedback(`Subiendo... ${Math.min(i + BATCH_SIZE, mappedData.length)} de ${mappedData.length} registros.`); } setFeedback('¡Importación completada con éxito!'); onImportSuccess(); setTimeout(() => closeModal(), 2000); } catch (error) { if (error instanceof Error) { setFeedback(`Error: ${error.message}`); } else { setFeedback('Ocurrió un error desconocido.'); } } finally { setIsProcessing(false); }};
  const closeModal = () => { setIsModalOpen(false); setFile(null); setFeedback(''); setIsProcessing(false); };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} style={styles.importButton}>
        <UploadIcon />
        Importar Datos
      </button>
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, animation: 'fadeIn 0.3s ease-out'}}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Importar Veedores</h2>
              <button onClick={closeModal} style={styles.closeButton}><CloseIcon /></button>
            </div>
            <p style={styles.modalSubtext}>El archivo debe ser .xlsx o .csv y tener las columnas correctas.</p>
            {!file ? (
              <label htmlFor="file-upload" style={{...styles.dropzone, borderColor: isDragging ? '#3B82F6' : '#D1D5DB'}} onDragOver={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)} onDrop={handleDrop}>
                <UploadIcon />
                <span style={{fontWeight: 600, color: '#3B82F6'}}>Sube un archivo</span> o arrástralo aquí
                <p style={{fontSize: '0.75rem', margin: 0, color: '#6B7280'}}>XLSX, CSV hasta 10MB</p>
                <input id="file-upload" type="file" accept=".xlsx, .csv" onChange={handleFileChange} style={{ display: 'none' }} disabled={isProcessing}/>
              </label>
            ) : (
              <div style={styles.filePreview}>
                <FileIcon />
                <span>{file.name}</span>
                <button onClick={() => setFile(null)} style={styles.removeFileButton} disabled={isProcessing}><CloseIcon /></button>
              </div>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={closeModal} style={styles.cancelButton} disabled={isProcessing}>Cancelar</button>
              <button onClick={handleImport} style={isProcessing ? {...styles.confirmButton, opacity: 0.7, cursor: 'wait'} : styles.confirmButton} disabled={!file || isProcessing}>
                {isProcessing ? 'Procesando...' : 'Confirmar e Importar'}
              </button>
            </div>
            {feedback && <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 500, color: feedback.startsWith('Error') ? '#DC2626' : '#16A34A' }}>{feedback}</p>}
          </div>
        </div>
      )}
    </>
  );
};


// ====================================================================
// PÁGINA PRINCIPAL
// ====================================================================
const formatDisplayDate = (dateString: string | null | undefined) => { if (!dateString) return '-'; const date = new Date(dateString); return date.toLocaleDateString('es-CO', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }); };

export default function VeedoresPage() {
  const [veedores, setVeedores] = useState<Veedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Estado para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVeedor, setEditingVeedor] = useState<Partial<Veedor> | null>(null);
  const [editFeedback, setEditFeedback] = useState('');

  const obtenerVeedores = async () => { setLoading(true); setError(null); const { data, error } = await supabase.from('veedores').select('*').order('id', { ascending: true }); if (error) { setError("Error al cargar datos: " + error.message); } else { setVeedores(data as Veedor[]); } setLoading(false); };
  useEffect(() => { obtenerVeedores(); }, []);
  const handleSelectRow = (id: number) => { setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]); };
  const handleSelectAll = () => { setSelectedRows(selectedRows.length === veedores.length ? [] : veedores.map(v => v.id)); };
  const handleDeleteSelected = async () => { if (selectedRows.length === 0) return; const confirmDelete = window.confirm(`¿Seguro que quieres eliminar ${selectedRows.length} registro(s)?`); if (confirmDelete) { setLoading(true); const { error } = await supabase.from('veedores').delete().in('id', selectedRows); if (error) { setError("Error al eliminar: " + error.message); } else { await obtenerVeedores(); setSelectedRows([]); } setLoading(false); } };

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
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingVeedor(prev => (prev ? { ...prev, [name]: value } : null));
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

  const closeModal = () => { setIsEditModalOpen(false); setEditingVeedor(null); setEditFeedback(''); };


  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <Image src="/logo.jpg" alt="Logo" width={250} height={80} priority />
          <h1 style={styles.title}>Pruebas ICFES 11A 2025</h1>
        </header>
        <div style={{...styles.actionsContainer, marginRight: '2rem'}}>
          <ImportButton onImportSuccess={obtenerVeedores} />
          <button onClick={handleDeleteSelected} disabled={selectedRows.length === 0} style={selectedRows.length > 0 ? styles.deleteButton : { ...styles.deleteButton, ...styles.deleteButtonDisabled }}>
            <TrashIcon />
            Eliminar ({selectedRows.length})
          </button>
        </div>
        {loading && <p>Cargando datos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}><input type="checkbox" checked={veedores.length > 0 && selectedRows.length === veedores.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} /></th>
                  <th style={styles.th}>No.</th>
                  <th style={styles.th}>NODO</th><th style={styles.th}>DEPARTAMENTO</th><th style={styles.th}>Cod_Ciudad</th><th style={styles.th}>COD CYL</th><th style={styles.th}>Ppal</th><th style={styles.th}>Ciudad</th><th style={styles.th}>Cod_Sitio</th><th style={styles.th}>Fecha aplica</th><th style={styles.th}>Hora</th><th style={styles.th}>Sitio</th><th style={styles.th}>Direccion</th><th style={styles.th}>Barrio</th><th style={styles.th}>SALONES</th><th style={styles.th}>CITADOS 10</th><th style={styles.th}>Contrato</th><th style={styles.th}>CAPACITA</th><th style={styles.th}>Nombres</th><th style={styles.th}>Apellidos</th><th style={styles.th}>Cedula</th><th style={styles.th}>Celular</th><th style={styles.th}>Correo</th><th style={styles.th}>Banco</th><th style={styles.th}>Tipo Cuenta</th><th style={styles.th}>No. Cuenta</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {veedores.map((veedor, index) => (
                  <tr key={veedor.id} style={{ ...styles.tr, backgroundColor: selectedRows.includes(veedor.id) ? '#E0E7FF' : (hoveredRowId === veedor.id ? '#F9FAFB' : 'transparent') }} onMouseEnter={() => setHoveredRowId(veedor.id)} onMouseLeave={() => setHoveredRowId(null)}>
                    <td style={styles.td}><input type="checkbox" checked={selectedRows.includes(veedor.id)} onChange={() => handleSelectRow(veedor.id)} style={{ cursor: 'pointer' }} /></td>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{veedor.nodo || '-'}</td><td style={styles.td}>{veedor.departamento || '-'}</td><td style={styles.td}>{veedor['Cod_Ciudad'] || '-'}</td><td style={styles.td}>{veedor['COD CYL'] || '-'}</td><td style={styles.td}>{veedor.ppal || '-'}</td><td style={styles.td}>{veedor.ciudad || '-'}</td><td style={styles.td}>{veedor['Cod_Sitio'] || '-'}</td><td style={styles.td}>{formatDisplayDate(veedor['Fecha aplica'])}</td><td style={styles.td}>{veedor.hora || '-'}</td><td style={styles.td}>{veedor.sitio || '-'}</td><td style={styles.td}>{veedor.direccion || '-'}</td><td style={styles.td}>{veedor.barrio || '-'}</td><td style={styles.td}>{veedor.salones || '-'}</td><td style={styles.td}>{veedor['CITADOS 10'] || '-'}</td><td style={styles.td}>{veedor.contrato || '-'}</td><td style={styles.td}>{veedor.capacita || '-'}</td><td style={styles.td}>{veedor.nombres || '-'}</td><td style={styles.td}>{veedor.apellidos || '-'}</td><td style={styles.td}>{veedor.cedula || '-'}</td><td style={styles.td}>{veedor.celular || '-'}</td><td style={styles.td}>{veedor.correo || '-'}</td><td style={styles.td}>{veedor.banco || '-'}</td><td style={styles.td}>{veedor['Tipo Cuenta'] || '-'}</td><td style={styles.td}>{veedor['No. Cuenta'] || '-'}</td>
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
        )}

      {/* Modal de edición */}
      {isEditModalOpen && editingVeedor && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={styles.modalHeader}>
              <h2 style={{...styles.modalTitle, color: '#111827'}}>Editar Veedor</h2>
              <button onClick={closeModal} style={styles.closeButton}><CloseIcon /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {Object.keys(editingVeedor).filter(key => key !== 'id' && key !== 'createdAt').map(key => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor={key} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{key.replace(/_/g, ' ')}</label>
                  <input
                    id={key}
                    name={key}
                    type="text"
                    value={editingVeedor[key as keyof Veedor] || ''}
                    onChange={handleEditChange}
                    style={styles.editInput}
                    disabled={key === 'createdAt'}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={closeModal} style={styles.cancelButton} disabled={loading}>Cancelar</button>
                <button type="submit" style={loading ? {...styles.confirmButton, opacity: 0.7, cursor: 'wait'} : styles.confirmButton} disabled={loading}>
                  {loading ? 'Guardando...' : <><SaveIcon /> Guardar Cambios</>}
                </button>
              </div>
            </form>
            {editFeedback && <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 500, color: editFeedback.startsWith('Error') ? '#DC2626' : '#16A34A' }}>{editFeedback}</p>}
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
    actionsContainer: { marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
    tableContainer: { overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '0.75rem', backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' },
    trHeader: { borderBottom: '1px solid #E5E7EB' },
    th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', fontSize: '0.75rem' },
    td: { padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', color: '#374151', fontSize: '0.875rem' },
    tr: { transition: 'background-color 0.2s ease-in-out' },
    deleteButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#EF4444', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s, opacity 0.2s', },
    deleteButtonDisabled: { backgroundColor: '#9CA3AF', cursor: 'not-allowed', opacity: 0.6 },
    importButton: { padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #3B82F6', borderRadius: '0.375rem', backgroundColor: 'white', color: '#3B82F6', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s' },

    // -- INICIO DE CAMBIOS DE ESTILO EN EL MODAL --
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    modalTitle: { color: '#111827', margin: 0 }, // Título del modal en negro
    modalSubtext: { color: '#374151', marginTop: 0, marginBottom: '1.5rem' }, // Subtexto en gris oscuro
    closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#6B7280' },
    dropzone: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', border: '2px dashed #D1D5DB', borderRadius: '0.5rem', backgroundColor: '#F9FAFB', textAlign: 'center', color: '#374151', cursor: 'pointer', transition: 'border-color 0.2s' }, // Texto principal del dropzone en gris oscuro
    filePreview: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', color: '#111827' }, // Texto del archivo seleccionado en negro
    removeFileButton: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' },
    cancelButton: { padding: '0.625rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#374151' }, // Texto del botón cancelar en gris oscuro
    confirmButton: { padding: '0.625rem 1.25rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    // -- FIN DE CAMBIOS --

    // -- INICIO DE NUEVOS ESTILOS PARA ACCIONES DE FILA --
    actionsCell: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
    actionButton: { background: 'none', border: '1px solid #D1D5DB', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', color: '#6B7280', transition: 'background-color 0.2s', },
    editInput: { padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', transition: 'border-color 0.2s', color: '#111827' },
};