document.addEventListener('DOMContentLoaded', function() {
  const typeSelect = document.getElementById('type');
  const methodContainer = document.getElementById('method-container');
  const descriptionContainer = document.getElementById('description-container');
  const methodSelect = document.getElementById('method');
  const customerIdInput = document.getElementById('customer-id');
  const balanceDisplay = document.getElementById('customer-balance-display');
  const dateInput = document.getElementById('date');

  document.addEventListener('customerSelected', (event) => {
    const customerId = event.detail.id;
    customerIdInput.value = customerId;
    // Opcional: Actualizar el balance del cliente si es necesario
    fetch(`/api/customers/${customerId}/balance`)
      .then(response => response.json())
      .then(data => {
        const balance = data.balance;
        if (balanceDisplay) {
          balanceDisplay.textContent = `Balance del cliente: $${balance.toFixed(2)}`;
          if (balance < 0) {
            balanceDisplay.classList.add('negative');
            balanceDisplay.classList.remove('positive');
          } else {
            balanceDisplay.classList.remove('negative');
            balanceDisplay.classList.add('positive');
          }
        }
      })
      .catch(error => {
        console.error('Error fetching customer balance:', error);
      });
      const customerSelectionParagraph = document.getElementById('p-customer-selection');
      if (customerSelectionParagraph) {
        customerSelectionParagraph.style.display = 'none';
      }
  });

  
  function handleContainerVisibility() {
    if (typeSelect.value === 'Ingreso') {
      methodContainer.style.display = 'block';
      methodSelect.required = true;
      descriptionContainer.style.display = 'none';
      descriptionContainer.required = false;
      descriptionContainer.value = '';
    } else if (typeSelect.value === 'Ajuste') {
      descriptionContainer.style.display = 'block';
      descriptionContainer.required = true;
      descriptionContainer.value = '';
      methodContainer.style.display = 'none';
      methodSelect.required = false;
      methodSelect.value = ''; // Limpia la selección si no es requerida
    } else {
      methodContainer.style.display = 'none';
      methodSelect.required = false;
      methodSelect.value = '';
      descriptionContainer.style.display = 'none';
      descriptionContainer.required = false;
      descriptionContainer.value = '';
    }
  }
  typeSelect.addEventListener('change', handleContainerVisibility);
  handleContainerVisibility(); // Inicializa la visibilidad al cargar la página
  // toggleButton.addEventListener('click', toggleTransactionsVisibility);
  
  if (dateInput) {
    dateInput.value = getTodayDate();
  }
    function getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
});