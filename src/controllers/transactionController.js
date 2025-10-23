import transactionModel from '../models/transactionModel.js';
import customerModel from '../models/customerModel.js';
import PDFDocument from 'pdfkit';

const transactionController = {
  createTransaction: async (req, res) => {
    const transactionData = req.body;
    const { customer_id} = req.body;

    try {
      console.log('TRANSACTION DATA:', transactionData);
      const newTransaction = await transactionModel.createTransaction(transactionData);
      req.flash('success_msg', 'Transacción creada exitosamente');
      res.redirect('/transactions?customer_id=' + customer_id);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear la transacción' });
    }
  },
  showTransactionForm: async (req, res) => {
    //const customerId = req.params.customerId;
    try {
      //const customer = await customerModel.getCustomerById(customerId);
      //const transactions = await transactionModel.getTransactionsByCustomerId(customerId);
      //const balance = await transactionModel.getCustomerBalance(customerId);
      res.render('transactions', { title: 'Transacciones' });
    //: { id: customerId }
    } catch (err) {
      res.status(500).send('Error al cargar las transacciones');
    }
  },
  showTransactionHistory: async (req, res) => {
    const customerId = Number(req.query.customer_id);
    const { startDate, endDate } = req.query;
    try {
      const customer = await customerModel.getCustomerById(customerId);
      let transactions = []
      let initialBalance = 0;
      let finalBalance = 0;

      if (startDate && endDate) {
        transactions = await transactionModel.getTransactionsByCustomerIdAndDateRange(customerId, startDate, endDate);
        initialBalance = await transactionModel.getInitialBalance(customerId, startDate);
        finalBalance = await transactionModel.getFinalBalance(customerId, endDate);
      } else {
        transactions = await transactionModel.getTransactionsByCustomerId(customerId);
        finalBalance = await transactionModel.getFinalBalance(customerId, new Date().toISOString().split('T')[0]);
      }
      const safeTransactions = JSON.stringify(transactions || []).replace(/</g, '\\u003c');
      const safeCustomer = JSON.stringify(customer || {}).replace(/</g, '\\u003c');
      res.render('transactionHistory', { title: 'Historial de Transacciones', customer, transactions, initialBalance, finalBalance, startDate, endDate, safeTransactions, safeCustomer });
    } catch (err) {
      res.status(500).send('Error al cargar el historial de transacciones' + err.message);
    }
  },
  getAnnualReport: async (req, res) => {
    const year = parseInt(req.params.year, 10);
    try {
      const report = await transactionModel.getAnnualReport(year);
      console.log("Annual report data:", report);
      res.render('chartAnnual', { title: `Informe Anual ${year}`, chartData:report });
      //res.json(report);
    } catch (err) {
      res.status(500).json({ error: 'Error al generar el informe anual' });
    }
  },
  getCustomerBalance: async (customerId) => {
    try {
      const balance = await transactionModel.getCustomerBalance(customerId);
      return balance;
    } catch (err) {
      console.error('Error al obtener el balance del cliente:', err);
      return 0;
    }
  },
  exportTransactionsToPDF: async (req, res) => {
    const customerId = Number(req.query.customer_id);
    const { startDate, endDate } = req.query;

    try {
        // --- A. Lógica de Consulta de Datos (Reutilizada del controlador showTransactionHistory) ---

        let transactions = [];
        let initialBalance = 0;
        let finalBalance = 0;
        let customerName = 'Cliente Desconocido'; 

        const customer = await customerModel.getCustomerById(customerId);
        if (customer) {
            customerName = customer.name;
        }

        // Si se usan filtros, obtener los saldos y transacciones filtradas
        if (startDate && endDate) {
          console.log("Generating PDF for date range:", startDate, "to", endDate);
            initialBalance = await transactionModel.getInitialBalance(customerId, startDate);
            transactions = await transactionModel.getTransactionsByDateRange(customerId, startDate, endDate);
            console.log("transactions fetched for PDF:", transactions.length);
            if (transactions && transactions.length > 0) {
                finalBalance = Number(transactions[0].Saldo_Acumulado) + Number(initialBalance);
              } else {
                finalBalance = initialBalance;
            }
        } else {
            // Historial Completo
            console.log("Generating PDF for full transaction history.");
            transactions = await transactionModel.getTransactionsByCustomerId(customerId);
            if (transactions && transactions.length > 0) {
              finalBalance = Number(transactions[0].Saldo_Acumulado) + Number(initialBalance);
            }
        }

        // --- B. Generación del PDF con PDFKit ---

        const doc = new PDFDocument({ margin: 50 });

        // 1. Configurar la respuesta HTTP para descargar el PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_transacciones_${customerId}.pdf"`);

        // 2. Tubería del PDF al response stream
        doc.pipe(res);

        // 3. Contenido del PDF (Diseño)
        
        doc.fontSize(16).text('Historial de Transacciones', { align: 'center' });
        doc.moveDown();
        doc.fontSize(24).text(`Cliente: ${customerName} (ID: ${customerId})`, { align: 'center' });
        
        let periodText = 'Historial Completo';
        if (startDate && endDate) {
            periodText = `Período: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
        }
        doc.fontSize(12).text(periodText, { align: 'center' });
        doc.moveDown();

        // Función auxiliar para dibujar la tabla (simplificada)
        const drawTable = (doc, data, startY) => {
            let y = startY;
            const headers = ['Tipo/Detalle', 'Fecha', 'Monto', 'Saldo Final'];
            const columnWidths = [150, 80, 80, 80]; // Anchos aproximados

      // ⭐️ CÁLCULO DE CENTRADO 2: TABLA
            const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0); // 390
            // doc.page.width es el ancho total de la página (aprox. 595.28 para A4)
            const startX = doc.page.margins.left; // Margen izquierdo
            const pageEffectiveWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);
            
            // Calcula el margen sobrante y lo divide entre 2 para centrar
            const tableCenterOffset = (pageEffectiveWidth - tableWidth) / 2;
            const centeredStartX = startX + tableCenterOffset;

            // Dibujar encabezados (puedes usar colores y negrita)
            doc.font('Helvetica-Bold').fontSize(10);
            let x = centeredStartX;
            headers.forEach((header, i) => {
                doc.text(header, x, y);
                x += columnWidths[i];
            });
            y += 30;
            // Para posicionar el valor del saldo final en la columna correcta:
            const finalColumnX = centeredStartX + columnWidths[0] + columnWidths[1] + columnWidths[2];
            // Dibujar Saldo Inicial
            doc.font('Helvetica').fontSize(10);
            doc.rect(centeredStartX-20, y - 15, 400, 20).fill('#e0e0e0').stroke(); // Fondo gris
            doc.fillColor('black').text('SALDO FINAL', centeredStartX, y - 8);
            if (finalBalance >= 0 ) {
                doc.fillColor('green').fontSize(16).text(`$${finalBalance}`, finalColumnX, y - 10);
            } else {
                doc.fillColor('red').fontSize(16).text(`-$${Math.abs(finalBalance)}`, finalColumnX, y - 10);
            }
            y += 15;


            // Dibujar Filas de Transacciones
            doc.font('Helvetica').fontSize(10);
            transactions.forEach(t => {
                console.log('Drawing transaction row in PDF:', t);
                let x = centeredStartX;
                const detalle = t.type === 'Egreso' ? 'Venta' : t.type === 'Ingreso' ? `Entrega/${t.method}` : `Ajuste/${t.description || ''}`;
                doc.fillColor('black').text(detalle, x, y);
                x += columnWidths[0];
                const fecha = new Date(t.transaction_date).toLocaleDateString();
                doc.fillColor('black').text(fecha, x, y);
                x += columnWidths[1];
                const monto = `$${Number(t.amount).toFixed(2)}`;
                const isPositiveAmount = t.type === 'Ingreso' || (t.type === 'Ajuste' && Number(t.amount) >= 0);
                doc.fillColor(isPositiveAmount ? 'green' : 'red').text(monto, x, y);
                x += columnWidths[2];
                const saldoFinal = `$${(Number(t.Saldo_Acumulado) + Number(initialBalance)).toFixed(2)}`;
                const isPositiveSaldo = (Number(t.Saldo_Acumulado) + Number(initialBalance)) >= 0;
                doc.fillColor(isPositiveSaldo ? 'green' : 'red').text(saldoFinal, x, y);
                x += columnWidths[3];
              console.log('Drew transaction:', { detalle, fecha, monto, saldoFinal });
                y += 15;
                // Si llegamos cerca del final de la página, añadir una nueva página.
                if (y > 750) { 
                    doc.addPage();
                    y = 50;
                    // Redibujar encabezados si es necesario.
                }
            });


            doc.rect(centeredStartX-20, y , 400, 20).fill('#e0e0e0').stroke(); // Fondo gris
            doc.fillColor('black').text('SALDO INICIAL', centeredStartX, y +7);
            if (finalBalance >= 0 ) {
                doc.fillColor('green').fontSize(16).text(`$${initialBalance}`, finalColumnX, y +5);
            } else {
                doc.fillColor('red').fontSize(14).text(`-$${Math.abs(initialBalance)}`, finalColumnX, y +5);
            }
            // Dibujar Saldo Final
            // doc.rect(centeredStartX, y , 400, 20).fill('#e0e0e0').stroke();
            // doc.fillColor('black').text('SALDO INICIAL', centeredStartX, y + 2);
            // doc.fillColor('green').text(`$${initialBalance}`, finalColumnX, y + 2);
            y += 15;
            
            return y;
        };

        drawTable(doc, transactions, doc.y);
        
        // 4. Finalizar el documento
        doc.end();

    } catch (err) {
        console.error('Error al generar PDF en el servidor:', err);
        res.status(500).send('Error interno al generar el reporte PDF.');
    }
}
};

export default transactionController;