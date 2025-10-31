document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionTableDiv = document.getElementById('transaction-table');
  
  document.addEventListener('customerSelected', (event) => {
    const customer = event.detail;
    const endDate = urlParams.get('endDate') || '';
    const startDate = urlParams.get('startDate') || '';
    if (!customer || !customer.id) {
      transactionTableDiv.innerHTML = '<p class="text-danger">Por favor, seleccione un cliente.</p>';
    } else {
    console.log('Cliente seleccionado para ver historial:', customer);
    fetch(`/api/customers/${customer.id}/transactions?startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.json())
      .then(data => {
        renderTransactionHistory(transactionTableDiv, customer, data);
      })
      .catch(error => {
        console.error('Error fetching transaction history:', error);
        transactionTableDiv.innerHTML = '<p class="text-danger">Error al cargar el historial de transacciones.</p>';
      });
    }
  });
});

function renderTransactionHistory(container, customer, data) {
  let html = `<h3 class="text-center">Historial de Transacciones</h3>`;
  if (data.transactions.length === 0) {
    html += '<p>No se encontraron transacciones para este cliente.</p>';
  } else {
    html += `
      <input type="hidden" id="customer_id" name="customer_id" value="${customer.id}">
      <h3 class="text-center text-primary">Id:${customer.id} Nombre: ${customer.name}</h3>
      <h4 class="text-center ${data.finalBalance>= 0 ? 'positive' : 'negative'}">Saldo: $${data.finalBalance}</h4>
      <div class="table-header fixed-header movement-row fixed-top">
        <span class="movement-type w-50 text-center">Tipo/Detalle</span>
        <span class="movement-date w-25 text-center">Fecha</span>
        <span class="movement-amount w-25 text-center">Monto</span> 
        <span class="movement-running-balance w-25 text-center">Saldo Final</span>
        <span class="void w-25 text-center">Acción</span>
      </div>
    `;
    let runningBalance = 0;
    console.log('Transaction 1 render: ', data.transactions[0]);
    data.transactions.forEach(t => {
      runningBalance += t.type === 'Ingreso' ? Number(t.amount) : Number(-t.amount);
      html += `
        <div id="transaction-row-${t.id}" class="movement-row">
          <span class="movement-type w-50 text-center">
            ${t.type === 'Egreso' ? 'Venta' : t.type === 'Ingreso' ? `Ingreso/${t.method}` : 'Ajuste'}
            ${t.type === 'Ajuste' ? `
        <button class="btn-toggle-detalle btn btn-sm p-0 m-0" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#detalle-ajuste-${t.id}" 
                aria-expanded="false" 
                aria-controls="detalle-ajuste-${t.id}">
            <span aria-hidden="true">▼</span>
        </button>
        <div id="detalle-ajuste-${t.id}" class="collapse">
         ${t.description || 'N/A'}
        
        </div>
    ` : ''}
          </span>
          <span class="movement-date w-25 text-center">${new Date(t.transaction_date).toLocaleDateString()}</span>
          <span class="movement-amount w-25 text-center ${t.type === 'Ingreso' || (t.type === 'Ajuste' && t.amount > 0) ? 'positive' : 'negative'}">$${t.amount>0 ? Number(t.amount).toFixed(2): -Number(t.amount).toFixed(2) }</span>
          <span class="movement-running-balance w-25 text-center ${ t.Saldo_Acumulado > 0 ? 'positive' : 'negative'}">$${Number(t.Saldo_Acumulado).toFixed(2)}</span>
          <span class="void-button-container d-inline w-25 text-center">
          <button data-id=${t.id} data-customer-id=${t.customer_id} type="button" class="btn btn-outline-danger btn-sm void-button">${!t.is_deleted ? 'Anular' : ''}</button>
          </span>
        </div>
      `;
    });
  }
  container.innerHTML = html;
}