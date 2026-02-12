document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('barChart');
    const tableContainer = document.getElementById('reportTableContainer');
    const monthInput = document.getElementById('monthInput');
    const title = document.getElementById('title');
  
    // Si no existen los elementos necesarios, terminamos la ejecución
    if (!canvasElement || !tableContainer || !monthInput) {
        console.error("Elementos del DOM necesarios no encontrados (canvas, tabla o select).");
        return;
    }

    const ctx = canvasElement.getContext('2d');

    let balanceChart = null; 

    async function updateReport(year,month) {
        try {

            if (title) {
              title.textContent = `Informe Mensual ${month}/${year}`
            }
            tableContainer.innerHTML = 'Cargando reporte...';
            const response = await fetch(`/api/report/monthly-data?year=${year}&month=${month}`);
            if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }
            const data = await response.json();
            console.log("data monthly: ",data);
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
        const saldoData = chartData.map(item => parseFloat(item.total_saldo) || 0);
        const labels = chartData.map(item => item.zone);
        const dataConfig = {
            labels: labels,
            datasets: [
                { label: 'Saldo', data: saldoData, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 },
                { label: 'Ventas', data: egresosData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 },
                { label: 'Ingresos', data: ingresosData, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }
            ]
        };
        balanceChart = new Chart(ctx, {
            type: 'bar',
            data: dataConfig,
            options: {
                responsive: true,
                scales: {
                    y: {
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
        html += '<span class="col-ingresos col-text-right">Ingresos ($)</span>'
        html += '<span class="col-egresos col-text-right">Egresos ($)</span>'
        html += '<span class="col-saldo col-text-right">Saldo ($)</span>'
        html += '</div>';

        data.forEach(item => {
          const ingresos = parseFloat(item.total_ingreso) || 0;
          const egresos = parseFloat(item.total_egreso) || 0;
          const saldo = egresos - ingresos;
          html += '<div class="table-body-row table-row">'
          html += `<span class="col-zone col-text-center">${item.zone}</span>`;
          html += `<span class="col-ingresos col-text-right">${ingresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
          html += `<span class="col-egresos col-text-right">${egresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
          html += `<span class="col-saldo col-text-right">${saldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>`;
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

    monthInput.addEventListener('change', () => {
        const [month, year] = monthInput.value.split('/');
        updateReport(year, month);
    });

  });