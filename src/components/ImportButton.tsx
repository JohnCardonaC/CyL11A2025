'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // RUTA CORREGIDA Y DEFINITIVA
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ImportButton({ onImportSuccess }: { onImportSuccess: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFeedback('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setFeedback('Por favor, selecciona un archivo primero.');
      return;
    }
    setIsProcessing(true);
    setFeedback('Procesando archivo...');

    try {
      const data = await parseFile(file);
      setFeedback('Archivo leído. Mapeando columnas...');
      const mappedData = mapDataToSchema(data);
      setFeedback(`Datos mapeados. Subiendo ${mappedData.length} registros...`);

      const BATCH_SIZE = 100;
      for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
        const batch = mappedData.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('veedores').insert(batch);

        if (error) {
          throw new Error(`Error en Supabase: ${error.message}`);
        }
        setFeedback(`Subiendo... ${Math.min(i + BATCH_SIZE, mappedData.length)} de ${mappedData.length} registros.`);
      }

      setFeedback('¡Importación completada con éxito!');
      onImportSuccess();
      setTimeout(() => closeModal(), 2000);

    } catch (error: any) {
      console.error(error);
      setFeedback(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: (result) => resolve(result.data), error: (err) => reject(err) });
      } else if (file.name.endsWith('.xlsx')) {
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            resolve(json);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Formato no soportado. Usa .csv o .xlsx'));
      }
    });
  };

  const mapDataToSchema = (data: any[]): any[] => {
    return data.map(row => ({
      nodo: row.NODO, departamento: row.DEPARTAMENTO, Cod_Ciudad: row['Cod_Ciudad'], "COD CYL": row['COD CYL'], ppal: row.Ppal, ciudad: row.Ciudad, "Cod_Sitio": row['Cod_Sitio'], "Fecha aplica": row['Fecha aplica'], hora: row.Hora, sitio: row.Sitio, direccion: row.Direccion, barrio: row.Barrio, salones: row.SALONES, "CITADOS 10": row['CITADOS 10'], contrato: row.Contrato, capacita: row.CAPACITA, nombres: row.Nombres, apellidos: row.Apellidos, cedula: row.Cedula, celular: row.Celular, correo: row.Correo, banco: row.Banco, "Tipo Cuenta": row['Tipo Cuenta'], "No. Cuenta": row['No. Cuenta'],
    }));
  };
  
  const closeModal = () => {
    setIsModalOpen(false); setFile(null); setFeedback(''); setIsProcessing(false);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} style={importButtonStyle}>Importar Datos</button>
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Importar Veedores</h2>
            <p style={{color: '#6B7280'}}>El archivo debe tener las columnas correctas.</p>
            <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} style={{ display: 'block', marginBottom: '1rem' }} disabled={isProcessing} />
            {file && <p>Archivo: <strong>{file.name}</strong></p>}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={closeModal} style={cancelButtonStyle} disabled={isProcessing}>Cancelar</button>
              <button onClick={handleImport} style={isProcessing ? {...confirmButtonStyle, opacity: 0.5} : confirmButtonStyle} disabled={!file || isProcessing}>
                {isProcessing ? 'Procesando...' : 'Importar'}
              </button>
            </div>
            {feedback && <p style={{ marginTop: '1rem', color: feedback.startsWith('Error') ? 'red' : 'green' }}>{feedback}</p>}
          </div>
        </div>
      )}
    </>
  );
}
// Estilos
const importButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #1E40AF', borderRadius: '0.375rem', backgroundColor: '#EFF6FF', color: '#1E40AF', cursor: 'pointer', fontWeight: '600' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '500px' };
const cancelButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', backgroundColor: 'white', cursor: 'pointer' };
const confirmButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#1E40AF', color: 'white', cursor: 'pointer' };