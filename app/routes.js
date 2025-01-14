const express = require('express')
const router = express.Router()
const content = require('./data/content')

router.all('*', (req, res, next) => {
  const referrer = req.query.referrer
  res.locals.referrer = referrer
  res.locals.query = req.query
  res.locals.content = content
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

router.get('/', (req, res) => {
  res.redirect('/start')
})

require('./routes/interruption')(router)
require('./routes/overview')(router)
require('./routes/activity-log')(router)
require('./routes/application-list')(router)
require('./routes/applications')(router)
require('./routes/assign')(router)
require('./routes/shortlist')(router)
require('./routes/confirm-deferred-offer')(router)
require('./routes/defer-offer')(router)
require('./routes/edit-course')(router)
require('./routes/edit-condition-statuses')(router)
require('./routes/edit-offer')(router)
require('./routes/email')(router)
require('./routes/feedback')(router)
require('./routes/guidance')(router)
require('./routes/interviews')(router)
require('./routes/make-offer')(router)
require('./routes/notes')(router)
require('./routes/notification-settings')(router)
require('./routes/notifications')(router)
require('./routes/offer')(router)
require('./routes/organisation-settings')(router)
require('./routes/organisational-permissions')(router)
require('./routes/privacy')(router)
require('./routes/reject-application')(router)
require('./routes/reports')(router)
require('./routes/set-up-permissions')(router)
require('./routes/settings')(router)
require('./routes/users')(router)
require('./routes/withdraw-application')(router)
require('./routes/withdraw-offer')(router)

// examples
require('./routes/examples')(router)

module.exports = router
