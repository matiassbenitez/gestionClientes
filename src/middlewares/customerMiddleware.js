<<<<<<< HEAD
import customerModel from '../models/customerModel.js';

const customerMiddleware = {
  getCustomerByName: async (req, res, next) => {
    const { name } = req.body;
    console.log("Searching for customer with name:", name);
    try {
      const customers = await customerModel.getCustomerByName(name);
      req.customers = customers; // Attach customers to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },
  getCustomerById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const customer = await customerModel.getCustomerById(id);
      console.log("Found customer:", customer);
      if (customer) {
        req.customer = customer;
        next();
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },
  setView: (viewName, viewTitle) => {
    return (req, res, next) => {
      req.viewName = viewName;
      req.viewTitle = viewTitle;
      next();
    }
  }
}

=======
import customerModel from '../models/customerModel.js';

const customerMiddleware = {
  getCustomerByName: async (req, res, next) => {
    const { name } = req.body;
    console.log("Searching for customer with name:", name);
    try {
      const customers = await customerModel.getCustomerByName(name);
      req.customers = customers; // Attach customers to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },
  getCustomerById: async (req, res, next) => {
    const { id } = req.params;
    try {
      const customer = await customerModel.getCustomerById(id);
      console.log("Found customer:", customer);
      if (customer) {
        req.customer = customer;
        next();
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },
  setView: (viewName, viewTitle) => {
    return (req, res, next) => {
      req.viewName = viewName;
      req.viewTitle = viewTitle;
      next();
    }
  }
}

>>>>>>> 30106938222b6e29ea7510cba6c54322ea4978b4
export default customerMiddleware;