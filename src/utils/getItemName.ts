/**
 * Obtiene el nombre de un item de orden, incluyendo productos especiales
 * @param item - El order_item que puede tener menu_items o ser un producto especial
 * @returns El nombre del producto o "Item borrado" si no se puede determinar
 */
export const getItemName = (item: any): string => {
  // Si existe el menu_item, usar su nombre
  if (item.menu_items?.name) {
    return item.menu_items.name;
  }
  
  // Si no existe menu_item, verificar si es un producto especial
  if (item.notes) {
    try {
      const parsedNotes = JSON.parse(item.notes);
      if (parsedNotes.type === 'custom_product' && parsedNotes.name) {
        return parsedNotes.name;
      }
    } catch {
      // Si no es JSON válido, continuar
    }
  }
  
  // Por defecto, mostrar "Item borrado"
  return "Item borrado";
};