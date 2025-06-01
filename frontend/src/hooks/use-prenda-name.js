import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function usePrendaName(prendaId) {
  const [prendaName, setPrendaName] = useState(null);

  useEffect(() => {
    if (!prendaId) return;

    // Consultar el nombre de la prenda basado en prenda_id
    supabase
      .from('prendas')
      .select('nombre')
      .eq('id', prendaId)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPrendaName(data.nombre);
        } else if (error) {
          console.error('Error fetching prenda name:', error);
        }
      });
  }, [prendaId]);

  return prendaName;
}