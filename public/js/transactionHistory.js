document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);  
  const exportButton = document.getElementById("export_button");
    const transactionTable = document.getElementById("transaction-table");
    const customerNameEncoded = urlParams.get('customer_name');
    const customerName = decodeURIComponent(customerNameEncoded);
    const customerId = urlParams.get('customer_id');
    const event = new CustomEvent('customerSelected', { 
                detail: { 
                    id: customerId,
                    name: customerName
                } 
            });
            document.dispatchEvent(event);
    let necesitaRecarga = false;
    // document.addEventListener('customerSelected', (event) => {
    //     const customerId = event.detail.id;
    //     // Ejecutar la acción específica del historial: Redirigir
    //     window.location.href = `/transactions?customer_id=${customerId}`;
    // });

    async function anularTransaccion(transactionId, customerId) {
        if (!confirm("¿Estás seguro de que deseas anular esta transacción?")) {
            return;
        }

        try {
            const response = await fetch("/transactions/void", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // *** IMPORTANTE: AQUI DEBES AGREGAR TU TOKEN CSRF si usas uno ***
                },
                body: JSON.stringify({ transaction_id: transactionId }),
            });
            const result = await response.json();
            console.log("Resultado de anular transacción:", result);

            if (response.ok && result.success) {
                // Éxito: Modificar el frontend
                const row = document.getElementById(
                    "transaction-row-" + transactionId
                );
                if (row) {
                    row.classList.add("text-muted");
                    // Ocultar/deshabilitar el botón
                    row.querySelector("button").disabled = true;
                    row.querySelector("button").textContent = "Anulada";
                }
                mostrarFlashMessage(result.message, "success");

                // Mostrar la alerta de recarga
                if (!necesitaRecarga) {
                    necesitaRecarga = true;
                    mostrarAlertaDeRecarga();
                }
            } else {
                mostrarFlashMessage(
                    result.error || "Error desconocido.",
                    "danger"
                );
            }
        } catch (error) {
          console.log('Error en la solicitud de anulación:', error);
            mostrarFlashMessage("Error de conexión con el servidor.", "danger");
        }
    }

    if (exportButton) {
        exportButton.addEventListener("click", function () {
            // 1. Obtener el customer_id
            const customerIdInput = document.querySelector(
                'input[name="customer_id"]'
            );
            const customerId = customerIdInput ? customerIdInput.value : "";

            // 2. Obtener las fechas (si están presentes en la página)
            const startDateInput = document.getElementById("startDate");
            const endDateInput = document.getElementById("endDate");

            const startDate = startDateInput ? startDateInput.value : "";
            const endDate = endDateInput ? endDateInput.value : "";

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
    if (transactionTable) {
        transactionTable.addEventListener("click", function (event) {
            const voidButton = event.target.closest(".void-button");
            console.log(voidButton);
            if (voidButton) {
                event.preventDefault();
                const transactionId = voidButton.getAttribute("data-id");
                const customerId = voidButton.getAttribute("data-customer-id");
                if (transactionId) {
                    anularTransaccion(transactionId, customerId);
                }
            }
        });
    }
    function mostrarFlashMessage(message, type) {
        const flashContainer = document.getElementById("flash-messages");
        if (flashContainer) {
            const alertDiv = document.createElement("div");
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.role = "alert";
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            flashContainer.appendChild(alertDiv);
        }
    }
    function mostrarAlertaDeRecarga() {
        const container = document.getElementById("saldo-alert-container");
        container.innerHTML = `
        <div class="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
            <span>⚠️ Saldos desactualizados.</span>
            <a href='' onclick="window.location.reload(); return false;" 
               class="btn btn-warning btn-sm">
               Actualizar Saldos
            </a>
        </div>
    `;
    }
});
