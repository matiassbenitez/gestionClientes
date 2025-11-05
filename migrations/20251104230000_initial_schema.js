/** @type {import('sequelize').Migration} */
export const up = async (context) => {

  // ==========================================================
  // 1. CREACIÓN DE TABLAS (SIN LLAVES FORÁNEAS AÚN)
  // Se crean las tablas principales primero.
  // ==========================================================
  const { queryInterface, Sequelize } = context;
  // --- Tabla: users ---
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    // No se incluyen Timestamps (createdAt, updatedAt) porque tu modelo usa timestamps: false
  });

  // --- Tabla: zones ---
  await queryInterface.createTable('zones', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  // --- Tabla: customers ---
  await queryInterface.createTable('customers', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: Sequelize.STRING(15),
      allowNull: true,
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    zone_id: { // Columna que será la FK
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  // --- Tabla: transactions ---
  await queryInterface.createTable('transactions', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: { // Columna que será la FK
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    method: {
      type: Sequelize.STRING(50),
      defaultValue: null,
    },
    description: {
      type: Sequelize.STRING(50),
      defaultValue: null,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    transaction_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    is_reconciled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });
  
  // --- Tabla: debts ---
  // ASUMO que Debt se asocia a Customer (aunque no proporcionaste la asociación)
  // Si no se asocia, esta tabla es independiente.
  await queryInterface.createTable('debts', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Añadiré la FK 'customer_id' aquí, ya que el Debt probablemente pertenece a un Cliente
    customer_id: { 
        type: Sequelize.INTEGER,
        allowNull: true, // Si es un débito global, podría ser null. Si siempre es del cliente, false.
    },
    debt_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
  });


  // ==========================================================
  // 2. AÑADIR LLAVES FORÁNEAS (BASADO EN LAS ASOCIACIONES)
  // Las llaves foráneas se añaden después de que las tablas existan.
  // ==========================================================

  // Customer.belongsTo(Zone) => customers.zone_id -> zones.id
  await queryInterface.addConstraint('customers', {
    fields: ['zone_id'],
    type: 'foreign key',
    name: 'customers_zone_id_fkey',
    references: {
      table: 'zones',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // allowNull: true en zone_id, por lo que usamos SET NULL
  });

  // Transaction.belongsTo(Customer) => transactions.customer_id -> customers.id
  await queryInterface.addConstraint('transactions', {
    fields: ['customer_id'],
    type: 'foreign key',
    name: 'transactions_customer_id_fkey',
    references: {
      table: 'customers',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT', // allowNull: false en customer_id, por lo que usamos RESTRICT/NO ACTION
  });
  
  // --- ASUMIDO: Debt.belongsTo(Customer) ---
  await queryInterface.addConstraint('debts', {
    fields: ['customer_id'],
    type: 'foreign key',
    name: 'debts_customer_id_fkey',
    references: {
      table: 'customers',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', 
  });


};

/** @type {import('sequelize').Migration} */
export const down = async (context) => {
  // ==========================================================
  // REVERTIR (SE ELIMINA EN ORDEN INVERSO DE DEPENDENCIA)
  // ==========================================================
  const { queryInterface } = context;
  // Primero las tablas dependientes
  await queryInterface.dropTable('debts');
  await queryInterface.dropTable('transactions');
  await queryInterface.dropTable('customers'); 
  
  // Luego las tablas principales
  await queryInterface.dropTable('zones');
  await queryInterface.dropTable('users');
};