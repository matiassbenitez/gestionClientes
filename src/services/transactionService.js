import sequelize from "../config/sequelize.js";
import Transaction from "../models/transactionModel.js";
import Debt from "../models/debtModel.js";
import Customer from "../models/customerModel.js";
import Zone from "../models/zoneModel.js";
import { Op } from "sequelize";

const getRunningBalanceLiteral = (initialBalance) => sequelize.literal(`(
  SUM(
  CASE
    WHEN type = 'Ingreso' THEN amount
    WHEN type = 'Egreso' THEN -amount
    WHEN type = 'Ajuste' THEN amount
    ELSE amount
  END
  ) OVER (ORDER BY transaction_date ASC, id ASC) + ${initialBalance}
)`);
const totalBalanceLiteral = (sequelize) => sequelize.literal(`
    SUM(
        CASE 
            WHEN type = 'Ingreso' THEN amount 
            WHEN type = 'Egreso' THEN -amount 
            WHEN type = 'Ajuste' THEN amount 
            ELSE 0 
        END
    )
`);

const transactionService = {
  getTransactionsByCustomerId: async (customerId) => {
    const sequelize = Transaction.sequelize;
    try {
      const transactions = await Transaction.findAll({
        attributes: [
          'id',
          'transaction_date',
          'type',
          'method',
          'description',
          'amount',
          [getRunningBalanceLiteral(0), 'Saldo_Acumulado']
        ],
        where: {
          customer_id: customerId,
          is_deleted: false,
          is_reconciled: false,
        },
        order: [['transaction_date', 'ASC'], ['id', 'ASC']],
        raw: true,
      });
      return transactions.reverse();
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw err;
    }},
    getAllTransactions: async () => {
      try {
        const transactions = await Transaction.findAll({
          where: {
            is_deleted: false,
          },
          order: [['transaction_date', 'DESC'], ['id', 'DESC']],
        });
        return transactions;
      } catch (err) {
        console.error('Error fetching all transactions:', err);
        throw err;
      }
    },
    getTransactionsById: async (transactionId) => {
      try {
        const transaction = await Transaction.findOne({
          where: {
            id: transactionId,
            is_deleted: false,
          },
        });
        return transaction;
      } catch (err) {
        console.error('Error fetching transaction by ID:', err);
        throw err;
      }
    },
getInitialBalance: async (customer_id, startDate) => {
        const sequelize = Transaction.sequelize;

        const result = await Transaction.findOne({
            attributes: [
                [totalBalanceLiteral(sequelize), 'total_balance']
            ],
            where: {
                customer_id: customer_id,
                is_deleted: false,
                is_reconciled: false,
                transaction_date: {
                    [Op.lt]: startDate
                }
            },
            group: ['customer_id'], // Agrupar por customer_id para que SUM funcione
            raw: true
        });

        const initialBalance = result ? parseFloat(result.total_balance) : 0;
        console.log(`Saldo inicial para cliente ${customer_id} antes de ${startDate}: Saldo=${initialBalance}`);
        return initialBalance;
    },

    getFinalBalance: async (customer_id, endDate) => {
        const sequelize = Transaction.sequelize;

        const result = await Transaction.findOne({
            attributes: [
                [totalBalanceLiteral(sequelize), 'total_balance']
            ],
            where: {
                customer_id: customer_id,
                is_deleted: false,
                is_reconciled: false,
                transaction_date: {
                    [Op.lte]: endDate
                }
            },
            group: ['customer_id'],
            raw: true
        });

        const finalBalance = result ? parseFloat(result.total_balance) : 0;
        console.log(`Saldo final para cliente ${customer_id} hasta ${endDate}: Saldo=${finalBalance}`);
        return finalBalance;
    },
    getTransactionsByDateRange: async (customer_id, startDate, endDate) => {
        const sequelize = Transaction.sequelize;
        const initialBalance = await transactionService.getInitialBalance(customer_id, startDate);

        try {
            const transactions = await Transaction.findAll({
                attributes: [
                    'id',
                    'transaction_date',
                    'type',
                    'method',
                    'description',
                    'amount',
                    // ✅ Cálculo acumulado para mostrar el historial
                    [getRunningBalanceLiteral(initialBalance), 'Saldo_Acumulado']
                ],
                where: {
                    customer_id: customer_id,
                    is_deleted: false,
                    is_reconciled: false,
                    // ✅ CLAVE ANTI-ERROR: Filtro de rango seguro
                    transaction_date: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate 
                    }
                },
                // ✅ Ordenar para el cálculo acumulado (ASC)
                order: [
                    ['transaction_date', 'ASC'],
                    ['id', 'ASC']
                ],
                raw: true,
            });
            return transactions.reverse();

        } catch (error) {
            console.error("Error al obtener transacciones por rango de fecha:", error);
            throw error;
        }
    },
    getCustomerBalance: async (customerId) => {
    const sequelize = Transaction.sequelize;
    const result = await Transaction.findOne({
      attributes: [
        [totalBalanceLiteral(sequelize), 'total_balance']
      ],
      where: {
        customer_id: customerId,
        is_deleted: false,
        is_reconciled: false,
      },
      group: ['customer_id'],
      raw: true
    });
    const balance = result ? parseFloat(result.total_balance) : 0;
    return balance;
  },
  createTransaction: async (transactionData) => {
    try {
      const newTransaction = await Transaction.create(transactionData);
      return newTransaction.toJSON();
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  },
  toggleTransactionStatus: async (id) => {
    const transaction = await Transaction.findOne({ where: { id:id } });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    const newStatus = !transaction.is_deleted;
    await transaction.update({ is_deleted: newStatus });
    return transaction.toJSON();
  },
  getAnnualReport: async (year) => {
    const sequelize = Transaction.sequelize;
    const report = await Transaction.findAll({
      attributes: [
        [sequelize.literal('EXTRACT(MONTH FROM transaction_date)'), 'month'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN type = 'Ingreso' THEN amount WHEN (type = 'Ajuste' AND amount > 0) THEN amount ELSE 0 END`)), 'total_ingreso'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN type = 'Egreso' THEN amount WHEN (type = 'Ajuste' AND amount < 0) THEN -amount ELSE 0 END`)), 'total_egreso']
      ],
      where:{
        is_deleted: false,
        [Op.and]: sequelize.literal(`EXTRACT(YEAR FROM transaction_date) = ${year}`)
      },
      group: [sequelize.literal('EXTRACT(MONTH FROM transaction_date)')],
      order: [[sequelize.literal('month'), 'ASC']],
      raw: true,
    });
    const debtReport = await Debt.findAll({
      attributes: [
        [sequelize.literal('EXTRACT(MONTH FROM debt_date)'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_deudas']
      ],
      where:{
        [Op.and]: sequelize.literal(`EXTRACT(YEAR FROM debt_date) = ${year}`)
      },
      group: [sequelize.literal('EXTRACT(MONTH FROM debt_date)')],
      order: [[sequelize.literal('month'), 'ASC']],
      raw: true,
    });
    const finalReport = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = report.find(r => parseInt(r.month) === month);
      const debtData = debtReport.find(d => parseInt(d.month) === month);
      finalReport.push({
        month,
        total_deudas: debtData ? parseFloat(debtData.total_deudas) : 0,
        total_ingreso: monthData ? parseFloat(monthData.total_ingreso) : 0,
        total_egreso: monthData ? parseFloat(monthData.total_egreso) : 0,
      });
    }
    return finalReport;
  },
  getMonthlyReportGroupedByZone: async () => {
    const sequelize = Transaction.sequelize;
    console.log(`Generando informe GENERAL`);
    
    const report = await Transaction.findAll({
      attributes: [
        // 1. CORRECCIÓN: Usar la ruta completa de la asociación
        [sequelize.col('customer.zone.name'), 'zone_name'], 
        
        // 2. Cálculo de Ingresos y Egresos (sin cambios)
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "Transaction".type = 'Ingreso' THEN "Transaction".amount WHEN ("Transaction".type = 'Ajuste' AND "Transaction".amount > 0) THEN "Transaction".amount ELSE 0 END`)), 'total_ingreso'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "Transaction".type = 'Egreso' THEN "Transaction".amount WHEN ("Transaction".type = 'Ajuste' AND "Transaction".amount < 0) THEN -"Transaction".amount ELSE 0 END`)), 'total_egreso']
      ],
      include: [{
        model: Customer,
        as: 'customer', // <-- Alias 1
        attributes: [], 
        required: true, 
        include: [{ 
            model: Zone, 
            as: 'zone', // <-- Alias 2
            attributes: [], 
            required: true, 
        }]
      }],
      where:{
        is_deleted: false,
      },
      // 3. El GROUP BY ['zone_name'] ya es la solución final y es correcto
      group: ['zone_name'], 
      order: [
          [sequelize.col('zone_name'), 'ASC'] // También usamos el alias de columna aquí
      ],
      raw: true,
    });
    console.log(`Informe generado:`, report);
    return {
      reportByZone: report.map(item => ({
          zone: item.zone_name, // Usamos el alias 'zone_name'
          total_ingreso: parseFloat(item.total_ingreso) || 0,
          total_egreso: parseFloat(item.total_egreso) || 0,
          total_saldo: (parseFloat(item.total_egreso) || 0) - (parseFloat(item.total_ingreso) || 0)
      }))
    };
},
  getAvailableYears: async () => {
    const sequelize = Transaction.sequelize;
    const years = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM transaction_date'))), 'year']
      ],
      where: { is_deleted: false },
      order: [[sequelize.literal('year'), 'ASC']],
      raw: true,
    });
    return years.map(y => parseInt(y.year));
  },
  getAvailableMonthsYears: async () => {
    const sequelize = Transaction.sequelize;
    const monthsYears = await Transaction.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM transaction_date')), 'year'],
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM transaction_date')), 'month']
      ],
      where: { is_deleted: false },
      group: [
          sequelize.literal('EXTRACT(YEAR FROM transaction_date)'),
          sequelize.literal('EXTRACT(MONTH FROM transaction_date)')
      ],
      order: [[sequelize.literal('year'), 'ASC'], [sequelize.literal('month'), 'ASC']],
      raw: true,
    });
    return monthsYears.map(my => ({
      year: parseInt(my.year),
      month: parseInt(my.month)
    }));
  },
    
  };

export default transactionService;