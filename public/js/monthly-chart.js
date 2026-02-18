document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('barChart');
  const tableContainer = document.getElementById('reportTableContainer');
  const title = document.getElementById('title');

  // Si no existen los elementos necesarios, terminamos la ejecución
  if (!canvasElement || !tableContainer) {
    console.error("Elementos del DOM necesarios no encontrados (canvas, tabla o select).");
    return;
  }

  const ctx = canvasElement.getContext('2d');

  let balanceChart = null;

  async function updateReport(year, month) {
    try {

      if (title) {
        title.textContent = `Informe General`
      }
      tableContainer.innerHTML = 'Cargando reporte...';
      const response = await fetch(`/api/report/general`);
      if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }
      const data = await response.json();
      console.log("data monthly: ", data);
      if (data.success && data.report) {
        renderChart(data.report.reportByZone);
        renderTable(data.report.reportByZone);
      } else {
        tableContainer.innerHTML = `<p class="alert alert-warning">No se encontraron datos para el mes seleccionado.</p>`;
        if (balanceChart) balanceChart.destroy();
      }
    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      tableContainer.innerHTML = '<p class="alert alert-danger">Error de conexión al servidor.</p>';
      if (balanceChart) balanceChart.destroy();
    }
  }
  function renderChart(chartData) {
    if (balanceChart) {
      balanceChart.destroy();
    }
    const ingresosData = chartData.map(item => parseFloat(item.total_ingreso) || 0);
    const egresosData = chartData.map(item => parseFloat(item.total_egreso) || 0);
    const saldoData = chartData.map(item => -parseFloat(item.total_saldo) || 0);
    const labels = chartData.map(item => item.zone);
    const saldoColors = saldoData.map(valor =>
      valor >= 0 ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)'
    );

    const saldoBorders = saldoData.map(valor =>
      valor >= 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'
    );
    const dataConfig = {
      labels: labels,
      datasets: [
        {
          label: 'Saldo (+)',
          data: [],
          backgroundColor: 'rgba(0, 255, 0, 0.7)'
        },
        {
          label: 'Saldo (-)',
          data: [],
          backgroundColor: 'rgba(255, 0, 0, 0.7)'
        },
        { label: 'Saldo', data: saldoData, backgroundColor: saldoColors, borderColor: saldoBorders, borderWidth: 1 },
        { label: 'Ventas', data: egresosData, backgroundColor: 'rgba(190, 190, 190, 0.6)', borderColor: 'rgba(190, 190, 190, 1)', borderWidth: 1 },
        { label: 'Ingresos', data: ingresosData, backgroundColor: 'rgba(160, 160, 160, 0.6)', borderColor: 'rgba(160, 160, 160, 1)', borderWidth: 1 }
      ]
    };
    balanceChart = new Chart(ctx, {
      type: 'bar',
      data: dataConfig,
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
        legend: {
            labels: {
                // Filtramos para que NO dibuje la etiqueta de "Saldo"
                filter: function(item, chart) {
                    return item.text !== 'Saldo';
                }
            }
        }
      },
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }
  function renderTable(data) {
    let html = '<div class="data-table">'
    html += '<div class="fixed-header table-header table-row">'
    html += '<span class="col-zone col-text-center">Zona</span>'
    html += '<span class="col-egreso col-text-right">Ventas ($)</span>'
    html += '<span class="col-ingreso col-text-right">Ingresos ($)</span>'
    html += '<span class="col-saldo col-text-right">Saldo ($)</span>'
    html += '</div>';

    data.forEach(item => {
      const ingresos = parseFloat(item.total_ingreso) || 0;
      const egresos = parseFloat(item.total_egreso) || 0;
      const saldo = ingresos - egresos;
      const saldoClass = saldo >= 0 ? 'positive' : 'negative'
      html += '<div class="table-body-row table-row">'
      html += `<span class="col-zone col-text-center">${item.zone}</span>`;
      html += `<span class="col-egreso col-text-right"><small class="d-md-none text-muted">Ventas: </small>${egresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
      html += `<span class="col-ingreso col-text-right"><small class="d-md-none text-muted">Ingresos: </small>${ingresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
      html += `<span class="col-saldo col-text-right ${saldoClass} "><small class="d-md-none text-muted">Saldo: </small>${saldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
      html += '</div>';
    });
    html += '</div>';
    tableContainer.innerHTML = html;
  }

  const jsonData = canvasElement.getAttribute('data-chart-data');

  if (jsonData) {
    try {
      const initialData = JSON.parse(jsonData);
      renderChart(initialData);
      renderTable(initialData);
    } catch (error) {
      console.error("Error al parsear los datos iniciales del gráfico:", error);
    }
  }


});