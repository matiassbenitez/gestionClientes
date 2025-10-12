document.addEventListener('DOMContentLoaded', function() {
  const typeSelect = document.getElementById('type');
  const methodContainer = document.getElementById('method-container');
  const methodSelect = document.getElementById('method');
  const dateInput = document.getElementById('date');
  
  if (dateInput) {
      dateInput.value = getTodayDate();
  }
  
  function handleContainerVisibility() {
    if (typeSelect.value === 'Ingreso') {
      methodContainer.style.display = 'block';
      methodSelect.required = true;
    } else {
      methodContainer.style.display = 'none';
      methodSelect.required = false;
      methodSelect.value = ''; // Limpia la selección si no es requerida
    }
  }
  typeSelect.addEventListener('change', handleContainerVisibility);
  handleContainerVisibility(); // Inicializa la visibilidad al cargar la página
  
  function getTodayDate() {
    const today = new Date();
    
    const year = today.getFullYear();
    // Obtener el mes (getMonth() devuelve 0 para Enero, así que se suma 1)
    // Se usa padStart(2, '0') para asegurar que tenga 2 dígitos (ej. '05' en lugar de '5')
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
});