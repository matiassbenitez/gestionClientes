import debtModel from '../models/debtModel.js';

const debtController = {
  getAllDebts: async (req, res) => {
    try {
      const debts = req.debts;
      res.render('debts', { title: 'Deudas', debts: debts, debt: null });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las deudas' });
    }
  },
  createDebt: async (req, res) => {
    const debtData= req.body;
    try {
      const newDebt = await debtModel.createDebt(debtData);
      req.flash('success', 'Deuda creada exitosamente.');
      res.status(201).redirect('/debts/');
    } catch (error) {
      console.error('Error creating debt:', error);
      res.status(500).json({ success: false, message: 'Error creating debt' });
    }
  },
  getDebtForm: async (req, res) => {
    const { viewTitle, debt } = req;
    res.render('debts', { title: viewTitle, debt: debt, debts:null });
  },
  getUpdateDebtForm: async (req, res) => {
    const { id } = req.params;
    try {
      const debt = await debtModel.getDebtById(id);
      console.log("debt to update:", debt);
      if (debt) {
        req.debt = debt;
        req.viewTitle = 'Actualizar Deuda';
        return debtController.getDebtForm(req, res);
      } else {
        res.status(404).json({ error: 'Deuda no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener la deuda' });
    }
},
  updateDebt: async (req, res) => {
    const { id } = req.params;
    const debtData = req.body;
    try {
      const success = await debtModel.updateDebt(id, debtData);
      if (success) {
        req.flash('success', 'Deuda actualizada exitosamente.');
        res.redirect('/debts/');
      } else {
        res.status(404).json({ error: 'Deuda no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar la deuda' });
    }
  }
}

export default debtController;