import app from './index.js'
import dotenv from 'dotenv'
import customerModel from './models/customerModel.js'
import userModel from './models/userModel.js'
import transactionModel from './models/transactionModel.js'
import zoneModel from './models/zoneModel.js'
import debtModel from './models/debtModel.js'

dotenv.config()

const PORT = process.env.PORT || 3000
app.set('view engine', 'ejs')
app.set('views', './src/views')

async function startServer() {
  try {
    await userModel.createUserTable() 
    await zoneModel.createZoneTable()
    await customerModel.createCustomerTable()
    await transactionModel.createTransactionTable()
    await debtModel.createDebtTable()
    const userCount = await userModel.countUsers()
    if (userCount === 0) {
      app.locals.isSetupRequired = true
      console.log('⚠️ No admin user found. Please set up an admin user by sending a POST request to /setup with username and password in the body.')
    } else {
      app.locals.isSetupRequired = false
      console.log('✅ Admin user exists. You can log in normally.')
    }
    app.listen(PORT, () => {
      console.log(`Bellamoda running en http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Error iniciando el servidor:', err)
    process.exit(1)
  }
}

startServer()