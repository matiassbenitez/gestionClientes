<<<<<<< HEAD

const mainController = {
  getHomePage: (req, res) => {
    const isSetupRequired = req.app.locals.isSetupRequired;
    if (isSetupRequired) {
      return res.redirect('/setup'); // Redirect to setup if no admin user exists
    } else {
      if (!req.session.token){
        return res.redirect('/login'); // Redirect to login if admin user exists
      } else {
        res.render('index', {title: 'Inicio'}) // Render the index.ejs file
      }
    }
  }
}
=======

const mainController = {
  getHomePage: (req, res) => {
    const isSetupRequired = req.app.locals.isSetupRequired;
    if (isSetupRequired) {
      return res.redirect('/setup'); // Redirect to setup if no admin user exists
    } else {
      if (!req.session.token){
        return res.redirect('/login'); // Redirect to login if admin user exists
      } else {
        res.render('index', {title: 'Inicio'}) // Render the index.ejs file
      }
    }
  }
}
>>>>>>> 30106938222b6e29ea7510cba6c54322ea4978b4
export default mainController;