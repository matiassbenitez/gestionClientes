import Customer from "../services/customerService.js";

const mainController = {
  getHomePage: async (req, res) => {
    const isSetupRequired = req.app.locals.isSetupRequired;
    if (isSetupRequired) {
      return res.redirect('/setup'); // Redirect to setup if no admin user exists
    } else {
      if (!req.session.token){
        return res.redirect('/login'); // Redirect to login if admin user exists
      } else {
        const customerCount = await Customer.countCustomers();         
        res.render('index', {title: 'Inicio', count: customerCount}) // Render the index.ejs file
      }
    }
  }
}
export default mainController;