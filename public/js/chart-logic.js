document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('barChart');
    const tableContainer = document.getElementById('reportTableContainer');
    const yearSelect = document.getElementById('yearSelect');
    
    // Si no existen los elementos necesarios, terminamos la ejecución
    if (!canvasElement || !tableContainer || !yearSelect) {
        console.error("Elementos del DOM necesarios no encontrados (canvas, tabla o select).");
        return;
    }
    
    const ctx = canvasElement.getContext('2d');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // 1. Declaración de la variable de control del gráfico
    let balanceChart = null; 

    // --- 2. DEFINICIÓN DE FUNCIONES (Deben ir al inicio) ---
    
    async function updateReport(year) {
        try {
            tableContainer.innerHTML = 'Cargando reporte...';
            // Llamada AJAX
            const response = await fetch(`/api/reports/annual-data?year=${year}`);
            if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }
            
            const data = await response.json();
            
            if (data.success && data.report) {
                renderChart(data.report); 
                renderTable(data.report); 
            } else {
                tableContainer.innerHTML = `<p class="alert alert-warning">No se encontraron datos para el año ${year}.</p>`;
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
        const labels = chartData.map(item => monthNames[item.month - 1]);

        const dataConfig = {
            labels: labels,
            datasets: [
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
                    y: { beginAtZero: true, title: { display: true, text: 'Monto ($)' } }
                }
            }
        });
    }

    function renderTable(data) {
        // Tu lógica de renderizado de tabla, asegurando el formato de moneda
        let html = '<div class="data-table">'
        html += '<div class="fixed-header table-header table-row">'
        html += '<span class="col-mes col-text-center">Mes</span>'
        html += '<span class="col-egreso col-amount">Total Ventas</span>'
        html += '<span class="col-ingreso col-amount">Total Entregas</span>'
        html += '<span class="col-saldo col-amount">Saldo Neto</span>'
        html += '</div>';

        data.forEach((item) => {
            const ingresos = parseFloat(item.total_ingreso) || 0;
            const egresos = parseFloat(item.total_egreso) || 0;
            const saldoNeto = ingresos - egresos;
            
            const mes = monthNames[item.month - 1];
            const saldoClass = saldoNeto >= 0 ? 'positive' : 'negative'; 

            html += `<div class="table-body-row table-row">
                <span class="col-mes col-text-center">${mes}</span>
                <span class="col-egreso col-amount negative">$${egresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span class="col-ingreso col-amount positive">$${ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                <span class="col-saldo col-amount ${saldoClass}">$${saldoNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>`
        });
        html += '</div>'
        tableContainer.innerHTML = html
    }


    // --- 3. LÓGICA DE INICIALIZACIÓN (Solo se ejecuta una vez al final) ---
    
    const jsonData = canvasElement.getAttribute('data-chart-data');
    
    if (jsonData) {
        // 3a. Carga Inicial Rápida (con datos pasados por EJS)
        try {
            const initialChartData = JSON.parse(jsonData);
            renderChart(initialChartData);
            renderTable(initialChartData);
        } catch (e) {
            console.error("Error al parsear data-chart-data:", e);
        }
    } else if (yearSelect.value) {
        // 3b. Carga Inicial con AJAX (si no hay data en el EJS)
        updateReport(yearSelect.value);
    }
    
    // --- 4. EVENT LISTENER ---
    yearSelect.addEventListener('change', () => {
        const selectedYear = yearSelect.value;
        console.log("Año seleccionado:", selectedYear);
        updateReport(selectedYear);
    });
});
