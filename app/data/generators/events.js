const DateHelper = require('../helpers/dates')
const ApplicationHelper = require('../helpers/application')
const { fakerEN_GB: faker } = require('@faker-js/faker')

const _ = require('lodash')
const { DateTime } = require('luxon')
const weighted = require('weighted')

module.exports = (params) => {
  const events = { items: [] }

  let date = DateTime.fromISO(params.submittedDate)
  events.items.push({
    title: 'Application received',
    user: 'Candidate',
    date,
    meta: {
      course: {
        provider: params.provider,
        course: params.course,
        location: params.location,
        studyMode: params.studyMode,
        accreditedBody: params.accreditedBody,
        fundingType: params.fundingType,
        qualifications: params.qualifications
      }
    }
  })

  // if the application is not received, assign a user from the
  // accredited body and training provider
  if (params.status.toLowerCase() !== 'received') {
    if (params.assignedUsers.length) {
      date = DateHelper.getFutureDate(date)

      let assignedUsers = params.assignedUsers.filter(user => user.organisation.id === params.organisation.id)

      assignedUsers = assignedUsers.sort((a, b) => a.firstName.localeCompare(b.firstName) ||
          a.lastName.localeCompare(b.lastName) ||
          a.emailAddress.localeCompare(b.emailAddress))

      const eventTitle = (assignedUsers.length > 1) ? 'Users assigned' : 'User assigned'

      events.items.push({
        title: eventTitle,
        user: faker.person.fullName(),
        date,
        assignedUsers
      })
    }
  }

  if (faker.helpers.arrayElement([true, false]) && (params.interviews || params.offer)) {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Shortlisted',
      user: faker.person.fullName(),
      date,
      meta: {
        course: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications
        }
      }
    })
  }

  // we know there are currently 2 interviews set up

  if (params.interviews && params.interviews.items[0]) {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Interview set up',
      user: faker.person.fullName(),
      date,
      meta: {
        interview: params.interviews.items[0],
        interviewId: params.interviews.items[0].id
      }
    })
  }

  if (params.interviews && params.interviews.items[1]) {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Interview set up',
      user: faker.person.fullName(),
      date,
      meta: {
        interview: params.interviews.items[1],
        interviewId: params.interviews.items[0].id
      }
    })

    if (faker.helpers.arrayElement([true])) {
      date = DateHelper.getFutureDate(date)

      var interview = _.clone(params.interviews.items[1])
      interview.location = 'https://zoom.us/boom/town'

      events.items.push({
        title: 'Interview updated',
        user: faker.person.fullName(),
        date,
        meta: {
          interview,
          interviewId: interview.id
        }
      })
    }

    if (faker.helpers.arrayElement([true])) {
      date = DateHelper.getFutureDate(date)

      events.items.push({
        title: 'Interview cancelled',
        user: faker.person.fullName(),
        date,
        meta: {
          interview,
          interviewId: interview.id,
          cancellationReason: 'We cannot interview you this week. We’ll call you to reschedule.'
        }
      })
    }
  }

  date = DateHelper.getFutureDate(date)

  if (params.notes.items.length > 0) {
    // to align dates
    params.notes.items[0].date = date

    events.items.push({
      title: 'Note added',
      user: params.notes.items[0].sender,
      date,
      meta: {
        note: params.notes.items[0]
      }
    })
  }

  if (params.status === 'Rejected') {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Application rejected',
      user: faker.person.fullName(),
      date
    })
  }

  if (params.status === 'Application withdrawn') {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Application withdrawn',
      user: 'Candidate',
      date
    })
  }

  const conditions = ApplicationHelper.getConditions(params.offer)

  if (params.offer) {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Offer made',
      user: faker.person.fullName(),
      date,
      meta: {
        offer: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications,
          conditions
        }
      }
    })
  }

  if (params.status === 'Offer withdrawn') {
    date = DateHelper.getFutureDate(date)

    const user = weighted.select({
      'Sally Jones': 0.7,
      'Support team': 0.3
    })

    events.items.push({
      title: 'Offer withdrawn',
      user,
      date,
      meta: {
        offer: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications,
          conditions
        }
      }
    })
  }

  if (params.status === 'Conditions pending') {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Offer accepted',
      user: 'Candidate',
      date,
      meta: {
        offer: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications,
          conditions
        }
      }
    })
  } else if (params.status === 'Declined') {
    date = DateHelper.getFutureDate(date)

    if (faker.helpers.arrayElement([true, false])) {
      events.items.push({
        title: 'Offer automatically declined',
        date,
        meta: {
          offer: {
            provider: params.provider,
            course: params.course,
            location: params.location,
            studyMode: params.studyMode,
            accreditedBody: params.accreditedBody,
            fundingType: params.fundingType,
            qualifications: params.qualifications,
            conditions
          }
        }
      })
    } else {
      events.items.push({
        title: 'Offer declined',
        user: 'Candidate',
        date,
        meta: {
          offer: {
            provider: params.provider,
            course: params.course,
            location: params.location,
            studyMode: params.studyMode,
            accreditedBody: params.accreditedBody,
            fundingType: params.fundingType,
            qualifications: params.qualifications,
            conditions
          }
        }
      })
    }
  }

  if (params.status === 'Recruited') {
    if (conditions.length) {
      date = DateHelper.getFutureDate(date)
      events.items.push({
        title: 'Offer accepted',
        user: faker.person.fullName(),
        date,
        meta: {
          offer: {
            provider: params.provider,
            course: params.course,
            location: params.location,
            studyMode: params.studyMode,
            accreditedBody: params.accreditedBody,
            fundingType: params.fundingType,
            qualifications: params.qualifications,
            conditions
          }
        }
      })
      date = DateHelper.getFutureDate(date)
      events.items.push({
        title: 'Conditions marked as met',
        user: faker.person.fullName(),
        date,
        meta: {
          offer: {
            provider: params.provider,
            course: params.course,
            location: params.location,
            studyMode: params.studyMode,
            accreditedBody: params.accreditedBody,
            fundingType: params.fundingType,
            qualifications: params.qualifications,
            conditions
          }
        }
      })
    } else {
      date = DateHelper.getFutureDate(date)
      events.items.push({
        title: 'Offer accepted',
        user: faker.person.fullName(),
        date,
        meta: {
          offer: {
            provider: params.provider,
            course: params.course,
            location: params.location,
            studyMode: params.studyMode,
            accreditedBody: params.accreditedBody,
            fundingType: params.fundingType,
            qualifications: params.qualifications
          }
        }
      })
    }
  }

  if (params.status === 'Conditions not met' && conditions.length) {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Conditions marked as not met',
      user: faker.person.fullName(),
      date,
      meta: {
        offer: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications,
          conditions
        }
      }
    })
  }

  if (params.status === 'Deferred') {
    date = DateHelper.getFutureDate(date)

    events.items.push({
      title: 'Offer deferred',
      user: faker.person.fullName(),
      date,
      meta: {
        offer: {
          provider: params.provider,
          course: params.course,
          location: params.location,
          studyMode: params.studyMode,
          accreditedBody: params.accreditedBody,
          fundingType: params.fundingType,
          qualifications: params.qualifications,
          conditions
        }
      }
    })
  }

  return events
}
