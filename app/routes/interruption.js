const ApplicationHelper = require('../data/helpers/application')

module.exports = router => {
  router.get('/interruption', (req, res) => {
    const applications = req.session.data.applications.map(app => app).reverse()

    const needsFeedbackCount = applications.filter((app) => {
      return app.status == 'Rejected' && !app.rejectedReasons
    }).length

    res.render('interruption', {
      needsFeedbackCount
    })
  })
}
