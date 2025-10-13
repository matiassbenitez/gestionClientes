import zoneModel from '../models/zoneModel.js';
import exceljs from 'exceljs';

const zoneController = {
  getAllZones: async (req, res) => {
    try {
      const zones = req.zones;
      res.render('zones', { title: 'Zonas', zones: zones, zone: null });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las zonas' });
    }
  },
  createZone: async (req, res) => {
    const { name } = req.body; 
    try {
      const newZone = await zoneModel.createZone(name);
      req.flash('success_msg', 'Zona agregada exitosamente');
      res.redirect('/zones/');
    } catch (err) {
      res.status(500).json({ error: 'Error al agregar la zona' });
    }
  },
  updateZone: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const success = await zoneModel.updateZone(id, name);
      if (success) {
        req.flash('success_msg', 'Zona actualizada exitosamente');
        res.redirect('/zones/');
      } else {
        res.status(404).json({ error: 'Zona no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar la zona' });
    }
  },getZoneForm: async (req, res) => {
    const { viewTitle, zone } = req;
    res.render('zones', { title: viewTitle, zone: zone, zones:null });
  },
  getUpdateZoneForm: async (req, res) => {
    const { id } = req.params;
    try {
      const zone = await zoneModel.getZoneById(id);
      console.log("zone to update:", zone);
      if (zone) {
        req.zone = zone;
        req.viewTitle = 'Actualizar Zona';
        return zoneController.getZoneForm(req, res);
      } else {
        res.status(404).json({ error: 'Zona no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener la zona' });
    }
  },
  getZoneRoadmap: async (req, res) => {
    const { id } = req.params;
    try {
      const customers = await zoneModel.getCustomersInZone(id);
      console.log("Customers in zone:", customers);
      req.zoneCustomers = customers; // Attach customers to the request object
      const zone = await zoneModel.getZoneById(id);
      if (customers && zone) {
        res.render('zoneRoadmap', { title: `Hoja de Ruta - ${zone.name}`, zone: zone, customers: customers });
      } else {
        res.status(404).json({ error: 'Zona no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener la zona' });
    }
  },
  exportCustomersToExcel: async (req, res) => {
    const { id } = req.params;
    try {
      const customers = await zoneModel.getCustomersInZone(id);
      const zone = await zoneModel.getZoneById(id);
      if (customers && zone) {
        // Configurar el encabezado para la descarga del archivo Excel
        res.setHeader('Content-Disposition', `attachment; filename=${zone.name}_clientes.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        // Crear un libro de trabajo y una hoja
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Customers');

        // Definir un estilo de borde común
        const borderStyle = { 
          top: { style: 'thin' }, 
          left: { style: 'thin' }, 
          bottom: { style: 'thin' }, 
          right: { style: 'thin' } 
        };

        // Definir las columnas
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Nombre', key: 'name', width: 25 },
          { header: 'Dirección', key: 'address', width: 25 },
          { header: 'Teléfono', key: 'phone_number', width: 15 },
          { header: 'Saldo', key: 'balance', width: 15, style: { numFmt: '"$"#,##0.00;[Red]\-"$"#,##0.00' }
        }]; 
        
        // aplicar estilo al encabezado
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, size: 12, color: { argb: 'FF000080' } };
        // Aplicar borde a todas las celdas del encabezado
        headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = borderStyle;
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' } // Un gris claro para el fondo del encabezado
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        //agregar filas y aplicar formato condicional
        let city = '';
        customers.forEach(customer => {
          if (customer.city !== city) {
            city = customer.city;
            const cityRow = worksheet.addRow([`${city}`]);
            cityRow.font = { bold: true, size: 14, color: { argb: 'FF0000FF' } };
            // Estilo para la fila de la ciudad (encabezado agrupador)
            cityRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9E1F2' } // Color para la fila de la ciudad
            };
            cityRow.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells(`A${cityRow.number}:E${cityRow.number}`);
            // Aplicar borde a la celda fusionada de la ciudad
            cityRow.getCell(1).border = borderStyle; 
          }

          const row = worksheet.addRow({
            id: customer.id,
            name: customer.name,
            address: customer.address,
            phone_number: customer.phone_number,
            balance: '$ ' + customer.balance
          });

          // Aplicar borde a todas las celdas de la fila de datos del cliente
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = borderStyle;
            if (colNumber === 1 || colNumber ===4 || colNumber === 5) {
            cell.alignment = { horizontal: 'center' };
        }
          });

          const balanceCell = row.getCell('balance');
          if (customer.balance < 0) {
            balanceCell.font = { color: { argb: 'FFFF0000' } }; // rojo para saldo negativo
          } else {
            balanceCell.font = { color: { argb: 'FF008000' } }; // verde para saldo positivo
          }
        });

        // Enviar el archivo Excel al cliente
        await workbook.xlsx.write(res);
        res.end();
      }
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      res.status(500).json({ error: 'Error al exportar los clientes a Excel' });
    }
}
};

export default zoneController;