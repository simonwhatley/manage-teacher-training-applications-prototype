const ApplicationHelper = require('../data/helpers/application')
const content = require('../data/content')
const _ = require('lodash')

module.exports = router => {
  router.get('/applications/:applicationId/offer/edit-condition-statuses', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)
    const conditions = ApplicationHelper.getConditions(application.offer)

    res.render('applications/offer/edit-condition-statuses/index', {
      application,
      conditions
    })
  })

  router.post('/applications/:applicationId/offer/edit-condition-statuses', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    res.redirect(`/applications/${req.params.applicationId}/offer/edit-condition-statuses/check`)
  })

  router.get('/applications/:applicationId/offer/edit-condition-statuses/check', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    // mixin new data statuses with conditions
    const conditions = ApplicationHelper.getConditions(application.offer).map(condition => {
      return {
        id: condition.id,
        description: condition.description,
        status: req.session.data['edit-condition-statuses'].conditions[condition.id]
      }
    })

    const hasNotMetConditions = _.some(conditions, (condition) => {
      return condition.status === 'Not met'
    })

    const allConditionsMet = _.every(conditions, (condition) => {
      return condition.status === 'Met'
    })

    res.render('applications/offer/edit-condition-statuses/check', {
      application,
      conditions,
      hasNotMetConditions,
      allConditionsMet
    })
  })

  router.post('/applications/:applicationId/offer/edit-condition-statuses/check', (req, res) => {
    const application = req.session.data.applications.find(app => app.id === req.params.applicationId)

    const conditions = ApplicationHelper.getConditions(application.offer).forEach(c => {
      const condition = ApplicationHelper.getCondition(application.offer, c.id)
      condition.status = req.session.data['edit-condition-statuses'].conditions[condition.id]
    })

    let flash

    if (ApplicationHelper.hasMetAllConditions(application.offer)) {
      application.status = 'Recruited'
      flash = content.markConditionsAsMet.successMessage
      ApplicationHelper.addEvent(application, {
        title: content.markConditionsAsMet.event.title,
        user: 'Ben Brown',
        date: new Date().toISOString(),
        meta: {
          offer: {
            provider: application.offer.provider,
            course: application.offer.course,
            location: application.offer.location,
            accreditedBody: application.offer.accreditedBody,
            conditions: ApplicationHelper.getConditions(application.offer)
          }
        }
      })
    } else if (ApplicationHelper.getConditions(application.offer).some(c => c.status == 'Not met')) {
      application.status = 'Conditions not met'
      flash = content.markConditionsAsNotMet.successMessage
      ApplicationHelper.addEvent(application, {
        title: content.markConditionsAsNotMet.event.title,
        user: 'Ben Brown',
        date: new Date().toISOString(),
        meta: {
          offer: {
            provider: application.offer.provider,
            course: application.offer.course,
            location: application.offer.location,
            accreditedBody: application.offer.accreditedBody,
            conditions: ApplicationHelper.getConditions(application.offer)
          }
        }
      })
    } else {
      flash = 'Status of conditions updated'
      ApplicationHelper.addEvent(application, {
        title: content.updateStatusOfConditions.event.title,
        user: 'Ben Brown',
        date: new Date().toISOString(),
        meta: {
          offer: {
            provider: application.offer.provider,
            course: application.offer.course,
            location: application.offer.location,
            accreditedBody: application.offer.accreditedBody,
            conditions: ApplicationHelper.getConditions(application.offer)
          }
        }
      })
    }

    req.flash('success', flash)
    res.redirect(`/applications/${req.params.applicationId}/offer`)
  })
}
