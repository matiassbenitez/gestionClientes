<<<<<<< HEAD
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const sessionToken = req.session.token
  console.log(req.session.token)
  if (!sessionToken) {
    req.flash('error_msg', 'No token provided or invalid format');
    res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    console.error('Token verification failed:', err)
    req.flash('error_msg', 'Invalid or expired token');
    res.redirect('/login');
    //return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

=======
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const sessionToken = req.session.token
  console.log(req.session.token)
  if (!sessionToken) {
    req.flash('error_msg', 'No token provided or invalid format');
    res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    console.error('Token verification failed:', err)
    req.flash('error_msg', 'Invalid or expired token');
    res.redirect('/login');
    //return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

>>>>>>> 30106938222b6e29ea7510cba6c54322ea4978b4
export default authMiddleware