// Utility function to format modifier notes for display
export function formatModifierNotes(notes: string): string {
  if (!notes) return '';
  
  // If it's not JSON, return as is
  if (!notes.startsWith('{')) {
    return notes;
  }
  
  try {
    const parsedNotes = JSON.parse(notes);
    
    // Handle modifier notes
    if (parsedNotes.selectedModifiers) {
      const modifierText = Object.entries(parsedNotes.selectedModifiers)
        .map(([group, options]) => `${group}: ${(options as string[]).join(', ')}`)
        .join(' • ');
      const originalNotes = parsedNotes.original_notes ? ` | ${parsedNotes.original_notes}` : '';
      return modifierText + originalNotes;
    }
    
    // Handle custom product notes
    if (parsedNotes.type === 'custom_product') {
      // Para productos especiales, solo mostrar las notas originales (no el nombre)
      // El nombre ya se muestra con getItemName()
      return parsedNotes.original_notes || '';
    }
    
    // Handle other JSON notes with original_notes
    if (parsedNotes.original_notes) {
      return parsedNotes.original_notes;
    }
    
    // If we can't parse the structure, return the raw JSON (fallback)
    return notes;
  } catch (e) {
    // If parsing fails, return the raw notes
    return notes;
  }
}

// Alternative format for printing (more compact)
export function formatModifierNotesForPrint(notes: string): string {
  if (!notes) return '';
  
  // If it's not JSON, return as is
  if (!notes.startsWith('{')) {
    return notes;
  }
  
  try {
    const parsedNotes = JSON.parse(notes);
    
    // Handle modifier notes - more compact format for printing
    if (parsedNotes.selectedModifiers) {
      const modifierText = Object.entries(parsedNotes.selectedModifiers)
        .map(([group, options]) => `${group}: ${(options as string[]).join('/')}`)
        .join(', ');
      const originalNotes = parsedNotes.original_notes ? `\n${parsedNotes.original_notes}` : '';
      return modifierText + originalNotes;
    }
    
    // Handle custom product notes
    if (parsedNotes.type === 'custom_product') {
      // Para productos especiales, solo mostrar las notas originales (no el nombre)
      // El nombre ya se muestra con getItemName()
      return parsedNotes.original_notes || '';
    }
    
    // Handle other JSON notes with original_notes
    if (parsedNotes.original_notes) {
      return parsedNotes.original_notes;
    }
    
    // If we can't parse the structure, return the raw JSON (fallback)
    return notes;
  } catch (e) {
    // If parsing fails, return the raw notes
    return notes;
  }
}