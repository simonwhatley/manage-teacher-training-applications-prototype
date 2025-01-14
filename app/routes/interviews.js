const PaginationHelper = require('../data/helpers/pagination')
const ApplicationHelper = require('../data/helpers/application')
const SystemHelper = require('../data/helpers/system')
const content = require('../data/content')
const _ = require('lodash')
const { DateTime } = require('luxon')
const { v4: uuidv4 } = require('uuid')

function getTimeObject (time) {
  let hours
  let mins
  const isAm = time.indexOf('am') > -1
  if (isAm) {
    time = time.split('am')[0].trim()
    if (time.indexOf(':') > -1) {
      hours = time.split(':')[0]
      mins = time.split(':')[1]
    } else {
      hours = time
      mins = '00'
    }

    // if they selected 12am
    if (hours == '12') {
      hours = '00'
    }
  } else {
    time = time.split('pm')[0].trim()
    if (time.indexOf(':') > -1) {
      hours = time.split(':')[0]
      mins = time.split(':')[1]
    } else {
      hours = time
      mins = '00'
    }

    // convert to 24 hour only if not 12, if it's 12pm it's fine as 12
    if (hours != '12') {
      hours = parseInt(hours, 10) + 12
    }
  }

  return { hours, mins }
}

function getInterviews (applications) {
  let interviews = []
  applications = applications
    .filter(app => {
      return app.interviews.items.length > 0
    })

  // update this to use FLATMAP
  applications.forEach(app => {
    const ints = app.interviews.items.map(item => {
      return {
        app,
        interview: item
      }
    })
    interviews = interviews.concat(ints)
  })

  interviews.sort((a, b) => {
    return new Date(a.interview.date) - new Date(b.interview.date)
  })

  return interviews
}

function groupInterviewsByDate (interviews) {
  return _.groupBy(interviews, (interview) => {
    const interviewDate = DateTime.fromISO(interview.interview.date)
    const groupDate = DateTime.fromObject({
      day: interviewDate.day,
      month: interviewDate.month,
      year: interviewDate.year
    })
    return groupDate.toString()
  })
}

module.exports = router => {
  router.get('/interviews', (req, res) => {
    // remove the search keywords if present to reset the search
    delete req.session.data.keywords

    const now = SystemHelper.now()

    let interviews = getInterviews(req.session.data.applications).filter(interview => {
      return DateTime.fromISO(interview.interview.date) >= DateTime.fromISO(now)
    })

    // Get the pagination data
    const pagination = PaginationHelper.getPagination(interviews, req.query.page, req.query.limit)

    interviews = PaginationHelper.getDataByPage(interviews, req.query.page, req.query.limit)
    interviews = groupInterviewsByDate(interviews)

    res.render('interviews/index', {
      now,
      interviews,
      pagination
    })
  })

  router.get('/interviews/past', (req, res) => {
    const now = SystemHelper.now()
    let interviews = getInterviews(req.session.data.applications).filter(interview => {
      return DateTime.fromISO(interview.interview.date) < DateTime.fromISO(now)
    }).reverse()
    const pagination = PaginationHelper.getPagination(interviews, req.query.page, req.query.limit)
    interviews = PaginationHelper.getDataByPage(interviews, req.query.page, req.query.limit)
    interviews = groupInterviewsByDate(interviews)
    res.render('interviews/past', {
      interviews,
      pagination
    })
  })

  router.get('/applications/:applicationId/interviews', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)
    const assignedUsers = ApplicationHelper.getAssignedUsers(application, req.session.data.user.id, req.session.data.user.organisation.id)

    const now = SystemHelper.now()

    let upcomingInterviews = []
    let pastInterviews = []

    if (application.status == 'Received' || application.status == 'Interviewing') {
      upcomingInterviews = ApplicationHelper.getUpcomingInterviews(application)

      pastInterviews = application.interviews.items.filter(interview => {
        return DateTime.fromISO(interview.date) < now
      })
    } else {
      pastInterviews = application.interviews.items
    }

    res.render('applications/interviews/index', {
      application,
      upcomingInterviews,
      pastInterviews,
      assignedUsers,
      otherApplications: ApplicationHelper.getOtherApplications(application, req.session.data.applications)
    })
  })

  router.get('/applications/:applicationId/interviews/new', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    res.render('applications/interviews/new/index', {
      application
    })
  })

  router.post('/applications/:applicationId/interviews/new', (req, res) => {
    res.redirect(`/applications/${req.params.applicationId}/interviews/new/check`)
  })

  router.get('/applications/:applicationId/interviews/new/check', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    res.render('applications/interviews/new/check', {
      application
    })
  })

  router.post('/applications/:applicationId/interviews/new/check', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    application.interviews.items = application.interviews.items || []

    const id = uuidv4()

    const time = getTimeObject(req.session.data.interview.time)

    const date = DateTime.local(parseInt(req.session.data.interview.date.year, 10), parseInt(req.session.data.interview.date.month, 10), parseInt(req.session.data.interview.date.day, 10), parseInt(time.hours, 10), parseInt(time.mins, 10))

    const interview = {
      id,
      date: date.toISO(),
      details: req.session.data.interview.details,
      location: req.session.data.interview.location,
      organisation: req.session.data.interview.organisation
    }

    application.interviews.items.push(interview)

    application.events.items.push({
      title: content.createInterview.event.title,
      user: 'Angela Mode',
      date: new Date().toISOString(),
      meta: {
        interviewId: id,
        interview: _.clone(interview)
      }
    })

    // set the new status
    application.status = 'Interviewing'

    delete req.session.data.interview

    req.flash('success', content.createInterview.successMessage)
    res.redirect(`/applications/${applicationId}/interviews`)
  })

  router.get('/applications/:applicationId/interviews/:interviewId/edit', (req, res) => {
    const applicationId = req.params.applicationId
    const interviewId = req.params.interviewId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    let interview

    if (req.session.data.interview) {
      const time = getTimeObject(req.session.data.interview.time)
      interview = req.session.data.interview
      interview.date = DateTime.local(parseInt(req.session.data.interview.date.year, 10), parseInt(req.session.data.interview.date.month, 10), parseInt(req.session.data.interview.date.day, 10), parseInt(time.hours, 10), parseInt(time.mins, 10))
    } else {
      interview = application.interviews.items.find(interview => interview.id === interviewId)
    }

    res.render('applications/interviews/edit/index', {
      application,
      interview
    })
  })

  router.post('/applications/:applicationId/interviews/:interviewId/edit', (req, res) => {
    res.redirect(`/applications/${req.params.applicationId}/interviews/${req.params.interviewId}/edit/check`)
  })

  router.get('/applications/:applicationId/interviews/:interviewId/edit/check', (req, res) => {
    const applicationId = req.params.applicationId
    const application = req.session.data.applications.find(app => app.id === applicationId)
    const interviewId = req.params.interviewId

    res.render('applications/interviews/edit/check', {
      application,
      interview: application.interviews.items.find(interview => interview.id === interviewId)
    })
  })

  router.post('/applications/:applicationId/interviews/:interviewId/edit/check', (req, res) => {
    const applicationId = req.params.applicationId
    const interviewId = req.params.interviewId
    const application = req.session.data.applications.find(app => app.id === applicationId)
    const interview = application.interviews.items.find(interview => interview.id === interviewId)

    const time = getTimeObject(req.session.data.interview.time)

    const date = DateTime.local(parseInt(req.session.data.interview.date.year, 10), parseInt(req.session.data.interview.date.month, 10), parseInt(req.session.data.interview.date.day, 10), parseInt(time.hours, 10), parseInt(time.mins, 10))

    interview.date = date.toISO()
    interview.details = req.session.data.interview.details
    interview.location = req.session.data.interview.location
    interview.organisation = req.session.data.interview.organisation

    application.events.items.push({
      title: content.updateInterview.event.title,
      user: 'Angela Mode',
      date: new Date().toISOString(),
      meta: {
        interviewId: interview.id,
        interview: _.clone(interview)
      }
    })

    delete req.session.data.interview

    req.flash('success', content.updateInterview.successMessage)
    res.redirect(`/applications/${applicationId}/interviews`)
  })

  router.get('/applications/:applicationId/interviews/:interviewId/delete', (req, res) => {
    const applicationId = req.params.applicationId
    const interviewId = req.params.interviewId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    res.render('applications/interviews/delete/index', {
      application,
      interview: application.interviews.items.find(interview => interview.id === interviewId)
    })
  })

  router.post('/applications/:applicationId/interviews/:interviewId/delete', (req, res) => {
    res.redirect(`/applications/${req.params.applicationId}/interviews/${req.params.interviewId}/delete/check`)
  })

  router.get('/applications/:applicationId/interviews/:interviewId/delete/check', (req, res) => {
    const applicationId = req.params.applicationId
    const interviewId = req.params.interviewId
    const application = req.session.data.applications.find(app => app.id === applicationId)

    res.render('applications/interviews/delete/check', {
      application,
      interview: application.interviews.items.find(interview => interview.id === interviewId)
    })
  })

  router.post('/applications/:applicationId/interviews/:interviewId/delete/check', (req, res) => {
    const applicationId = req.params.applicationId
    const interviewId = req.params.interviewId
    const application = req.session.data.applications.find(app => app.id === applicationId)
    const interview = application.interviews.items.find(interview => interview.id === interviewId)

    ApplicationHelper.cancelInterview({
      application,
      interview,
      cancellationReason: req.session.data.cancelInterview.reason
    })

    // rollback the status
    application.status = 'Received'

    req.flash('success', content.cancelInterview.successMessage)

    if (application.interviews.items.length) {
      res.redirect(`/applications/${req.params.applicationId}/interviews/`)
    } else {
      res.redirect(`/applications/${req.params.applicationId}`)
    }
  })
}
