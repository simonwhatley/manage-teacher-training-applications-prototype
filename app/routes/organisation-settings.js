const ApplicationHelper = require('../data/helpers/application')

module.exports = router => {
  router.get('/organisation-settings', (req, res) => {
    const user = req.session.data.users[0]

    res.render('organisation-settings/index', {
      orgs: user.organisations
    })
  })
}
