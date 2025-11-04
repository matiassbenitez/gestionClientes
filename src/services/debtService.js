import Debt from "../models/debtModel.js";

const debtService = {
  getAllDebts: async () => {
    return await Debt.findAll({ order: [['debt_date', 'DESC']] });
  },

  getDebtById: async (id) => {
    return await Debt.findByPk(id);
  },
  createDebt: async (debt) => {
    const newDebt = await Debt.create(debt);
    return newDebt;
  },

  updateDebt: async (id, debt) => {
    const [updated] = await Debt.update(debt, { where: { id } });
    return updated > 0;
  },
};

export default debtService;