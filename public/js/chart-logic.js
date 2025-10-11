
document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('barChart');
  const tableContainer = document.getElementById('reportTableContainer');
  const ctx = canvasElement.getContext('2d');
  console.log("Chart context found:", ctx);

  if (canvasElement && tableContainer) {
    // Recupera la cadena JSON del atributo data-*
    const jsonData = canvasElement.getAttribute('data-chart-data');
    console.log("Raw chart data:", jsonData);
    // Parsea la cadena para obtener el objeto JavaScript
    const chartData = JSON.parse(jsonData);
    const ingresosData = chartData.map(item => item.total_ingreso);
    const egresosData = chartData.map(item => item.total_egreso);
    console.log("Parsed chart data:", chartData);
    console.log("Ingresos data:", ingresosData);
    console.log("Egresos data:", egresosData);
    // Continúa con la lógica de Chart.js como lo hacías antes
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = chartData.map(item => monthNames[item.month - 1]);
    // ... (resto del código de Chart.js)
    function renderTable(data) {
      let html = '<div class="data-table">'
    html += '<div class="fixed-header table-header table-row">'
    html += '<span class="col-mes col-text-center">Mes</span>' // Centramos el texto si es necesario
    html += '<span class="col-egreso col-amount">Total Ventas</span>'
    html += '<span class="col-ingreso col-amount">Total Entregas</span>' // Nueva clase para números
    html += '<span class="col-saldo col-amount">Saldo Neto</span>'
    html += '</div>';

    data.forEach((item, index) => {
        const mes = monthNames[item.month - 1];
        const ingresos = item.total_ingreso;
        const egresos = item.total_egreso;
        const saldoNeto = ingresos - egresos;
        
        // REUTILIZACIÓN DE CLASES DE COLOR/SIGNO
        // Usamos 'positive'/'negative' para el Saldo Neto (igual que en tu tabla de movimientos)
        const saldoClass = saldoNeto >= 0 ? 'positive' : 'negative'; 

        // Creamos clases específicas para que las columnas de números se alineen bien
        html += `<div class="table-body-row table-row">
            <span class="col-mes col-text-center">${mes}</span>
            
            <span class="col-egreso col-amount negative">$${egresos.toLocaleString('es-AR')}</span>
            
            <span class="col-ingreso col-amount positive">$${ingresos.toLocaleString('es-AR')}</span>
            
            <span class="col-saldo col-amount ${saldoClass}">$${saldoNeto.toLocaleString('es-AR')}</span>
        </div>`
    });
    html += '</div>'
      tableContainer.innerHTML = html
    }

    const dataConfig = {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Egresos',
          data: egresosData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
    //const balanceChart = 
    new Chart(ctx, {
      type: 'bar',
      data: dataConfig,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Monto ($)'}
          }
        }
      }
    });
    renderTable(chartData);
  }
});
