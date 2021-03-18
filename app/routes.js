const express = require('express')
const router = express.Router()

router.all('*', function(req, res, next){
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

require('./routes/application-list')(router)
require('./routes/activity-log')(router)
require('./routes/set-up-permissions')(router)
require('./routes/applications')(router)
require('./routes/reject-application')(router)
require('./routes/offer')(router)
require('./routes/make-offer')(router)
require('./routes/edit-offer')(router)
require('./routes/withdraw-offer')(router)
require('./routes/reconfirm-offer')(router)
require('./routes/notes')(router)
require('./routes/interviews')(router)
require('./routes/organisations')(router)
require('./routes/users')(router)
require('./routes/email')(router)
require('./routes/settings')(router)
require('./routes/notifications')(router)
require('./routes/withdraw-application')(router)

module.exports = router
