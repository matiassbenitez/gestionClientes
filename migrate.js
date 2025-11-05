import { Sequelize } from 'sequelize';
import { Umzug } from 'umzug';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './src/config/sequelize.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsPath = path.join(__dirname, 'migrations'); 

// ----------------------------------------------------
// 1. Configuración de Umzug
// ----------------------------------------------------
const umzug = new Umzug({
  migrations: { 
    //glob: migrationsPath + '/*.js', // Busca todos los archivos .js en 'migrations/'
    //glob: path.join(__dirname, 'migrations', '*.js'),
    glob: ['migrations/*.js', { cwd: __dirname }],
    resolve: ({ name, path: migrationPath, context }) => {
      // Necesario para que Umzug pueda leer los módulos ES (.js con 'type: module')
      const migrationUrl = new URL(`file:///${migrationPath}`);
      const migration = import(migrationUrl.toString());
      return {
        name,
        up: async () => (await migration).up(context, Sequelize),
        down: async () => (await migration).down(context, Sequelize),
      };
    },
  },
  context: { 
    queryInterface: sequelize.getQueryInterface(), 
    Sequelize: Sequelize 
  },
  storage: {
    async logMigration({ name }) {
      await sequelize.query(`INSERT INTO "SequelizeMeta" ("name") VALUES ('${name}');`);
    },
    async unlogMigration({ name }) {
      await sequelize.query(`DELETE FROM "SequelizeMeta" WHERE "name" = '${name}';`);
    },
    async executed() {
     try {
        // Intenta seleccionar las migraciones existentes.
        const [results] = await sequelize.query(`SELECT "name" FROM "SequelizeMeta" ORDER BY "name" ASC;`);
        return results.map(row => row.name);
    } catch (error) {
        // Si la tabla no existe (el error que viste), la creamos.
        if (error.message.includes('SequelizeMeta" does not exist')) {
            console.log('--- Creando tabla SequelizeMeta... ---');
            await sequelize.query(`CREATE TABLE "SequelizeMeta" ("name" VARCHAR(255) PRIMARY KEY);`);
            return []; // Retorna un array vacío, indicando que no se ha ejecutado ninguna migración aún.
        }
        // Si es otro error, lo relanzamos.
        throw error;
    }
    },
  }, 
  logger: console,
});

// ----------------------------------------------------
// 2. Función Principal para Ejecutar
// ----------------------------------------------------
async function runMigrations() {
  try {
    console.log('--- Iniciando conexión a la base de datos de Render ---');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa. Ejecutando migraciones pendientes...');
    //await umzug.executed();
    // Ejecuta las migraciones
    const executedMigrations = await umzug.up();

    if (executedMigrations.length > 0) {
      console.log('✨ Migraciones aplicadas con éxito:');
      executedMigrations.forEach(migration => console.log(`   - ${migration.name}`));
    } else {
      console.log('🎉 No hay nuevas migraciones pendientes para ejecutar.');
    }
    
  } catch (error) {
    console.error('❌ ERROR en la ejecución de las migraciones:', error.message);
    console.error('Sugerencia: Revisa tu DATABASE_URL, SSL y que la BD de Render esté activa.');
    process.exit(1);
    
  } finally {
    await sequelize.close(); 
    process.exit(0);
  }
}

// Ejecutar
runMigrations();