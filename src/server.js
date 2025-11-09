import app from './index.js'
import dotenv from 'dotenv'
import sequelize from './config/sequelize.js'
import './config/db.js'
import userService from './services/userService.js'
import './models/associations.js'

dotenv.config()

const PORT = process.env.PORT || 3000
const host = '0.0.0.0';
app.set('view engine', 'ejs')
app.set('views', './src/views')

async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a la base de datos establecida correctamente.')
    await sequelize.sync({force: false})
    console.log('✅ Modelos sincronizados con la base de datos.')
    const userCount = await userService.countUsers()
    if (userCount === 0) {
      app.locals.isSetupRequired = true
      console.log('⚠️ No admin user found. Please set up an admin user by sending a POST request to /setup with username and password in the body.')
    } else {
      app.locals.isSetupRequired = false
      console.log('✅ Admin user exists. You can log in normally.')
    }
    app.listen(PORT, host, () => {
      console.log(`Bellamoda running en http://localhost:${PORT}`)
      console.log(`Servidor escuchando en ${host}:${PORT}`);
    })
  } catch (err) {
    console.error('❌ Error iniciando el servidor:', err)
    process.exit(1)
  }
}

startServer()