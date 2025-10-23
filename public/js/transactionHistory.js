document.addEventListener('DOMContentLoaded', function() {
    const exportButton = document.getElementById('export_button');

    if (exportButton) {
        exportButton.addEventListener('click', function() {
            // 1. Obtener el customer_id
            const customerIdInput = document.querySelector('input[name="customer_id"]');
            const customerId = customerIdInput ? customerIdInput.value : '';

            // 2. Obtener las fechas (si están presentes en la página)
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';

            // 3. Construir la URL de exportación
            let url = `/transactions/export-pdf?customer_id=${customerId}`;
            
            if (startDate) {
                url += `&startDate=${startDate}`;
            }
            if (endDate) {
                url += `&endDate=${endDate}`;
            }

            // 4. Redirigir el navegador para iniciar la descarga del PDF
            window.location.href = url;
        });
    }
});