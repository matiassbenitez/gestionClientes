document.addEventListener('DOMContentLoaded', function() {
  const typeSelect = document.getElementById('type');
  const methodContainer = document.getElementById('method-container');
  const descriptionContainer = document.getElementById('description-container');
  const transactionTable = document.getElementById('transaction-table');
  const toggleButton = document.getElementById('toggle-transactions-button');
  const methodSelect = document.getElementById('method');
  const dateInput = document.getElementById('date');
  const customerSearchInput = document.getElementById('customer-search-input');
  const transactionForm = document.getElementById('transaction-form');
  const customerIdInput = document.getElementById('customer-id');
  const customerSelectionParagraph = document.getElementById('p-customer-selection');

  function debounce(func, delay) {
      let timeoutId; // Variable para almacenar el ID del temporizador

      // Esta es la función que se llamará en el evento 'input'
      return function() {
          // 'this' y 'arguments' capturan el contexto y los argumentos del evento
          const context = this;
          const args = arguments;

          // 1. Limpiar el temporizador anterior
          // Esto cancela la llamada anterior si el usuario sigue escribiendo
          clearTimeout(timeoutId);

          // 2. Establecer un nuevo temporizador
          // La función original (func) se ejecutará solo después del 'delay'
          timeoutId = setTimeout(() => {
              func.apply(context, args);
          }, delay);
      };
  }
  function fetchAndShowResults(query) {
    
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        mostrarResultados(data);
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        mostrarResultados([]);
      });
  }
  const debouncedFetchAndShowResults = debounce(fetchAndShowResults, 300);

  customerSearchInput.addEventListener('keyup', function() {
    const query = customerSearchInput.value.trim();
    let resultadosDiv = document.getElementById('customer-search-results');
    if (query.length === 0) {
      if (resultadosDiv) {
        customerSelectionParagraph.style.display = 'block';
        resultadosDiv.classList.remove('show');
        resultadosDiv.innerHTML = '';
      }
      return;
    } 
    debouncedFetchAndShowResults(query);
  });

  function mostrarResultados(customers) {
    let resultadosDiv = document.getElementById('customer-search-results');
    if (!resultadosDiv) {
      resultadosDiv = document.createElement('div');
      resultadosDiv.id = 'customer-search-results';
      resultadosDiv.className = 'dropdown-menu';
      customerSearchInput.parentNode.insertBefore(resultadosDiv, customerSearchInput.nextSibling);
    }
    resultadosDiv.style.width = customerSearchInput.offsetWidth + 'px';
    resultadosDiv.style.height = 'auto';
    resultadosDiv.style.paddingTop = '0';
    console.log("resultados:", resultadosDiv)
    resultadosDiv.classList.add('show');
    resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores
    if (customers.length === 0) {
      resultadosDiv.innerHTML = '<li>No se encontraron clientes.</li>';
      return;
    }
    const ul = document.createElement('ul');
    customers.forEach(customer => {
      const li = document.createElement('li');
      li.textContent = `${customer.name} (ID: ${customer.id})`;
      li.className = 'dropdown-item';
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        customerIdInput.value = customer.id;
        let balance = 0;
        fetch(`/api/customers/${customer.id}/balance`)
          .then(response => response.json())
          .then(data => {
            balance = data.balance;
            console.log("Selected customer balance inside fetch:", balance);
            const balanceDisplay = document.getElementById('customer-balance-display');
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
        console.log("Selected customer balance:", balance);
        resultadosDiv.classList.remove('show');
        customerSelectionParagraph.style.display = 'none';
        customerSearchInput.value = `${customer.name} (ID: ${customer.id})`; // Actualiza el campo visible
        resultadosDiv.innerHTML = ''; // Limpiar resultados después de la selección
      });
      resultadosDiv.appendChild(li);
    });
  }
  
  if (dateInput) {
      dateInput.value = getTodayDate();
  }

  // function toggleTransactionsVisibility() {
  //   if (transactionTable.style.display === 'none') {
  //     transactionTable.style.display = 'block';
  //   } else {
  //     transactionTable.style.display = 'none';
  //   }
  // }

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
  // toggleTransactionsVisibility(); // Inicializa la visibilidad al cargar la página

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