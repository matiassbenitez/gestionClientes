import customerModel from '../models/customerModel.js';

const customerController = {
  getAllCustomers: async (req, res) => {
    try {
      const customers = await customerModel.getAllCustomers();
      res.render('customers', {title: 'Clientes', customers});
      //res.json(customers);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener los clientes' });
    }
  },
  getCustomerById: async (req, res) => {
    const { id } = req.params; 
    try {
      const customer = await customerModel.getCustomerById(id);
      if (customer) {
        res.json(customer);
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },
  renderView: (req, res) => {
    const { customer, customers, viewName, viewTitle } = req;
    res.render(viewName, { title: viewTitle, customers:customers, customer:customer, searched: true });
  },
  getCustomerByName: async (req, res) => {
    const { name } = req.body;
    console.log("Searching for customer with name:", name);
    try {
      const customers = await customerModel.getCustomerByName(name);
      console.log("Found customers:", customers);
      res.render('searchCustomer', {title: 'Clientes', customers: customers, searched: true});
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },

  addCustomer: async (req, res) => {
    const customerData = req.body;
    try {
      const newCustomer = await customerModel.addCustomer(customerData);
      req.flash('success_msg', 'Cliente agregado exitosamente');
      res.redirect('/customers/' + newCustomer.id);
    } catch (err) {
      res.status(500).json({ error: 'Error al agregar el cliente' });
    }
  },
  updateCustomer: async (req, res) => {
    const { id } = req.params;
    const customerData = req.body;
    customerData.zone_id = customerData.zone_id ? parseInt(customerData.zone_id) : null;
    console.log("customer data:", customerData);
    try {
      const success = await customerModel.updateCustomer(id, customerData);
      console.log("Update success:", success);
      if (success) {
        req.flash('success_msg', 'Cliente actualizado exitosamente');
        res.redirect('/customers/' + id);
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (err) {
      console.log('Error al actualizar el cliente:', err);
      res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
  },
  getSearchForm: (req, res) => {
    console.log("Rendering search form");
    res.render('searchCustomer', { title: 'Buscar Cliente', customers: [], searched: false });
  }

}

export default customerController;