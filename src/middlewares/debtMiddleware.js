import debtService from '../services/debtService.js';

const debtMiddleware = {
  attachDebts: async (req, res, next) => {
    try {
      const debts = await debtService.getAllDebts();
      req.debts = debts;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las deudas' });
    }
  }
};

export default debtMiddleware;