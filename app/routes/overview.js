const CycleHelper = require('../data/helpers/cycles')
const { DateTime } = require('luxon')
const _ = require('lodash')
const user = require('../data/generators/user')

function getBreakdown (params) {
  const organisation = params.organisation
  const location = params.location

  let orgType = 'provider'
  if (organisation.isAccreditedBody) {
    orgType = 'accreditedBody'
  }

  // override
  if (params.actingAsTrainingProvider) {
    orgType = 'provider'
  }

  let applications = params.applications
    .filter(app => app.cycle == CycleHelper.CURRENT_CYCLE.code)
    .filter(app => app[orgType] == organisation.name)

  if (location && location.name) {
    applications = applications
      .filter(app => app.location && app.location.name == location.name)
  }

  const received = applications.filter(app => app.status == 'Received')
  const shortlisted = applications.filter(app => app.status == 'Shortlisted')
  const interviewing = applications.filter(app => app.status == 'Interviewing')

  const offered = applications.filter(app => app.status == 'Offered')
  const conditionsPending = applications.filter(app => app.status == 'Conditions pending')
  const recruited = applications.filter(app => app.status == 'Recruited')

  return {
    organisation,
    location,
    received,
    shortlisted,
    interviewing,
    offered,
    conditionsPending,
    recruited
  }
}

module.exports = router => {
  router.get('/overview', (req, res) => {
    const applications = req.session.data.applications.map(app => app).reverse()

    const receivedTodayCount = applications.filter(app => {
      return DateTime.fromISO(app.submittedDate).diffNow('days').days >= -1
    }).length

    const aboutToBeAutomaticallyRejectedCount = applications.filter((app) => {
      return app.daysToRespond < 5 && (app.status == 'Received' || app.status == 'Shortlisted' || app.status == 'Interviewing')
    }).length

    const needsFeedbackCount = applications.filter((app) => {
      return app.status == 'Rejected' && !app.rejectedReasons
    }).length

    const deferredOffersReadyToConfirm = applications.filter((app) => {
      return app.status == 'Deferred' && app.cycle == CycleHelper.PREVIOUS_CYCLE.code
    }).length

    const conditionsPending = applications.filter((app) => {
      return app.status == 'Conditions pending'
    }).length

    const activeApplicationsSections = []
    const userOrganisations = req.session.data.user.organisations
    userOrganisations.forEach(userOrganisation => {
      const activeApplicationsSection = {
        organisation: userOrganisation,
        partnersTable: {
          items: []
        },
        locationsTable: {
          items: []
        }
      }

      // Create locations table
      if (!userOrganisation.isAccreditedBody && userOrganisation.locations) {
        userOrganisation.locations.forEach(location => {
          activeApplicationsSection.locationsTable.items.push(getBreakdown({ organisation: userOrganisation, applications, location }))
        })
      }

      // create partners table

      // Populate the SCITT even though they are acting as a training provider for self ratified courses in this case
      if (userOrganisation.isAccreditedBody) {
        // populate the user org if it's an accredited body

        activeApplicationsSection.partnersTable.items.push(getBreakdown({ organisation: userOrganisation, applications, actingAsTrainingProvider: true }))

        // populate any locations as rows too
        if (userOrganisation.locations) {
          userOrganisation.locations.forEach(location => {
            activeApplicationsSection.partnersTable.items.push(getBreakdown({ organisation: userOrganisation, applications, location, actingAsTrainingProvider: true }))
          })
        }
      }

      // get partner data from relationships
      req.session.data.user.relationships.forEach(relationship => {
        // org 2 is always the partner
        const organisation = relationship.org2

        activeApplicationsSection.partnersTable.items.push(getBreakdown({ organisation, applications }))

        // populate any locations as rows too
        if (!organisation.isAccreditedBody && organisation.locations) {
          organisation.locations.forEach(location => {
            activeApplicationsSection.partnersTable.items.push(getBreakdown({ organisation, applications, location }))
          })
        }
      })

      activeApplicationsSection.partnersTable.items = _.uniqBy(activeApplicationsSection.partnersTable.items, function (item) {
        return item.organisation.id
      })

      activeApplicationsSections.push(activeApplicationsSection)
    })

    // dedupe

    res.render('overview', {
      boxes: {
        aboutToBeAutomaticallyRejectedCount,
        needsFeedbackCount,
        deferredOffersReadyToConfirm,
        conditionsPending,
        receivedTodayCount
      },
      activeApplicationsSections
    })
  })
}
