document.addEventListener('DOMContentLoaded', function() {
  const customerSearchInput = document.getElementById('customer-search-input');
  const customerSelectionParagraph = document.getElementById('p-customer-selection');
  const balanceDisplay = document.getElementById('customer-balance-display');
  const customerIdInput = document.querySelector('input[name="customer_id"]');
  
  
  function mostrarResultados(customers) {
    let resultadosDiv = document.getElementById('customer-search-results');
    // ... (Tu código de creación de resultadosDiv, ul, etc. - todo bien) ...
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
    resultadosDiv.innerHTML = ''; // Limpiar resultados anteriores
    resultadosDiv.classList.add('show');
    if (customers.length === 0) {
      const noResultsLi = document.createElement('li');
      noResultsLi.textContent = 'No se encontraron clientes.';
      noResultsLi.className = 'dropdown-item';
      resultadosDiv.appendChild(noResultsLi);
      return;
    }
    //const ul = document.createElement('ul');
    customers.forEach(customer => {
      const li = document.createElement('li');
      li.textContent = `${customer.name} (ID: ${customer.id})`;
      li.className = 'dropdown-item';
      li.style.cursor = 'pointer';    
      console.log("customer in li:", li);
      //ul.appendChild(li);
        li.addEventListener('click', () => {
            // 1. Limpieza de UI (Esto se queda)
            customerSearchInput.value = `${customer.name} (ID: ${customer.id})`; 
            //resultadosDiv.classList.remove('show');
            customerSelectionParagraph.style.display = 'none'; // Si lo necesitas
          
            // 2. Disparar el Evento Personalizado (LA CLAVE)
            const event = new CustomEvent('customerSelected', { 
                detail: { 
                    id: customer.id, 
                    name: customer.name 
                } 
            });
            resultadosDiv.classList.remove('show');
            document.dispatchEvent(event);
            
            // 3. Limpiar y terminar
            resultadosDiv.innerHTML = ''; 
            
            // ¡TODO el bloque de fetch, balance, y actualización del display DEBE ser ELIMINADO de aquí!
          });
          resultadosDiv.appendChild(li);
        // ...
    });
}

  const debouncedFetchAndShowResults = debounce(fetchAndShowResults, 300);

  customerSearchInput.addEventListener('keyup', function() {
    const query = customerSearchInput.value.trim();
    let resultadosDiv = document.getElementById('customer-search-results');
    if (query.length === 0) {
      if (resultadosDiv) {
        resultadosDiv.classList.remove('show');
        resultadosDiv.innerHTML = '';
      }
      if (customerIdInput) {
                customerIdInput.value = '';
            } 
            // 2. Limpiar la visualización del Balance
      if (balanceDisplay) {
          balanceDisplay.textContent = ''; // O texto inicial
          balanceDisplay.classList.remove('negative', 'positive');
      }
      customerSelectionParagraph.style.display = 'block';
      return;
    } 
    debouncedFetchAndShowResults(query);
  })

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
});