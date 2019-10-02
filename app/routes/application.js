/**
 * Application routes
 */
module.exports = router => {
  // Render application page
  router.all('/', (req, res) => {
    res.render('index', {
      status: req.query.status
    })
  })

  // Render application page
  router.all('/application/:applicationId', (req, res) => {
    res.render('application/index', {
      applicationId: req.params.applicationId,
      status: req.query.status
    })
  })

  router.post('/application/:applicationId/changed-status', (req, res) => {
    if (req.body.status === 'offer') {
      res.redirect(`/application/${req.params.applicationId}/make-offer`)
    } else {
      res.redirect(`/application/${req.params.applicationId}`)
    }
  })

  // Render other application pages
  router.all('/application/:applicationId/:view', (req, res) => {
    res.render(`application/${req.params.view}`, {
      applicationId: req.params.applicationId
    })
  })
}
