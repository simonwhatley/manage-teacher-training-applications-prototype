const PaginationHelper = require('../data/helpers/pagination')
const CycleHelper = require('../data/helpers/cycles')

const subjects = require('../data/subjects')
const locations = require('../data/locations')
const { default: request } = require('sync-request')
const { DateTime } = require('luxon')

const getSubjectItems = (selectedItems) => {
  const items = []

  subjects.forEach((subject, i) => {
    const item = {}

    item.text = subject.name
    item.value = subject.name
    item.id = subject.code
    item.checked = (selectedItems && selectedItems.includes(subject.name)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

const getStatusCheckboxItems = (selectedItems) => {
  const items = []

  const statuses = ['Received', 'Shortlisted', 'Interviewing', 'Offered', 'Conditions pending', 'Recruited', 'Deferred', 'Conditions not met', 'Declined', 'Rejected', 'Application withdrawn', 'Offer withdrawn']

  statuses.forEach((status, i) => {
    const item = {}

    item.text = status
    item.value = status
    item.checked = (selectedItems && selectedItems.includes(status)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getDateReceivedCheckboxItems = (selectedItems) => {
  const items = []

  const importantItems = ['Today', 'Yesterday', '2 days ago', '3 days ago']

  importantItems.forEach((importantItem, i) => {
    const item = {}

    item.text = importantItem
    item.value = importantItem
    item.checked = (selectedItems && selectedItems.includes(importantItem)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getDaysLeftToMakeDecisionCheckboxItems = (selectedItems) => {
  const items = []

  const daysLeftItems = ['5 days or fewer', 'More than 5 days']

  daysLeftItems.forEach((daysLeftItem, i) => {
    const item = {}

    item.text = daysLeftItem
    item.value = daysLeftItem
    item.checked = (selectedItems && selectedItems.includes(daysLeftItem)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getFeedbackCheckboxItems = (selectedItems) => {
  const items = []

  const tempItems = ['Needs feedback', 'Does not need feedback']

  tempItems.forEach((tempItem, i) => {
    const item = {}

    item.text = tempItem
    item.value = tempItem
    item.checked = (selectedItems && selectedItems.includes(tempItem)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getNoteCheckboxItems = (selectedItems) => {
  const items = []

  const noteItems = ['Has note', 'Does not have note']

  noteItems.forEach((noteItem, i) => {
    const item = {}

    item.text = noteItem
    item.value = noteItem
    item.checked = (selectedItems && selectedItems.includes(noteItem)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getSelectedSubjectItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const subject = {}
    subject.text = item.text
    subject.href = `/applications/remove-subject-filter/${item.text}`

    items.push(subject)
  })

  return items
}

const getUserItems = (users, assignedUsers = [], you = {}) => {
  let options = []

  // sort the users alphabetically
  users.sort((a, b) => a.firstName.localeCompare(b.firstName) ||
                        a.lastName.localeCompare(b.lastName) ||
                        a.emailAddress.localeCompare(b.emailAddress))

  users.forEach((user) => {
    const option = {}
    option.id = user.id
    option.value = user.id

    option.text = user.firstName + ' ' + user.lastName
    if (you && you.id === user.id) {
      option.text += ' (you)'
    }

    const hasDuplicateName = users.filter(u => u.firstName === user.firstName && u.lastName === user.lastName).length > 1

    if (hasDuplicateName) {
      option.hint = {}
      option.hint.text = user.emailAddress
      option.hint.classes = 'app-checkboxes__hint'
    }

    option.checked = false
    if (assignedUsers && assignedUsers.includes(user.id)) {
      option.checked = true
    }

    options.push(option)
  })

  if (you && you.id) {
    // get 'you' out of the options
    const youOption = options.find(option => option.value === you.id)

    // remove 'you' from the options
    options = options.filter(option => option.value !== you.id)

    // put 'you' as the first person in the list of options
    options.splice(0, 0, youOption)
  }

  // Add an 'unassigned' option as the first item in the array of options
  const unassigned = {}
  unassigned.id = 'unassigned'
  unassigned.value = 'unassigned'
  unassigned.text = 'Unassigned'
  unassigned.checked = false
  if (assignedUsers && assignedUsers.includes('unassigned')) {
    unassigned.checked = true
  }
  options.splice(0, 0, unassigned)

  return options
}

const getSelectedUserItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const user = {}
    user.text = item.text
    user.href = `/applications/remove-assignedUser-filter/${item.value}`

    items.push(user)
  })

  return items
}

const getUserFullName = (users, assignedUserId) => {
  let name = ''

  if (assignedUserId === 'unassigned') {
    name = 'Unassigned'
  } else {
    const assignedUser = users.find(user => user.id === assignedUserId)
    name = assignedUser.firstName + ' ' + assignedUser.lastName
  }

  return name
}

const getTrainingProviderItems = (providers, selectedProviders) => {
  return providers
    .sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    .map(org => {
      return {
        value: org.name,
        text: org.name,
        checked: selectedProviders && selectedProviders.includes(org.name) ? 'checked' : ''
      }
    })
}

const getAccreditedBodyItems = (accreditedBodies, selectedAccreditedBodies) => {
  return accreditedBodies
    .sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    .map(org => {
      return {
        value: org.name,
        text: org.name,
        checked: selectedAccreditedBodies && selectedAccreditedBodies.includes(org.name) ? 'checked' : ''
      }
    })
}

const getLocationItems = (selectedItems) => {
  const items = []

  locations.forEach((location, i) => {
    const item = {}

    item.text = location.name
    item.value = location.name
    item.id = location.code
    item.checked = (selectedItems && selectedItems.includes(location.name)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

const sortApplications = (applications, sort) => {
  let newApplications = []

  if (sort === 'Updated most recently') {
    newApplications = applications.sort((a, b) => {
      const aEvents = a.events.items
      const bEvents = b.events.items
      return new Date(bEvents[bEvents.length - 1].date) - new Date(aEvents[aEvents.length - 1].date)
    })
  } else if (sort === 'Updated least recently') {
    newApplications = applications.sort((a, b) => {
      const aEvents = a.events.items
      const bEvents = b.events.items
      return new Date(aEvents[aEvents.length - 1].date) - new Date(bEvents[bEvents.length - 1].date)
    })
  } else {
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Received').sort(function (a, b) {
      return a.daysToRespond - b.daysToRespond
    }))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Shortlisted').sort(function (a, b) {
      return a.daysToRespond - b.daysToRespond
    }))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Interviewing').sort(function (a, b) {
      return a.daysToRespond - b.daysToRespond
    }))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Offered').sort((a, b) => {
      return a.daysToDecline - b.daysToDecline
    }))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Conditions pending'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Recruited'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Deferred'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Declined'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Rejected'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Application withdrawn'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Offer withdrawn'))
    newApplications = newApplications.concat(applications.filter((app) => app.status === 'Conditions not met'))
  }
  return newApplications
}

const getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name)
    ? name
    : [name].filter((name) => {
        return name !== '_unchecked'
      })) || data && (Array.isArray(data) ? data : [data])
}

const removeFilter = (value, data) => {
  // do this check because if coming from overview page for example,
  // the query/param will be a string value, not an array containing a string
  if (Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}

module.exports = router => {
  router.all('/applications', (req, res) => {
    const sort = req.session.data.sort = req.query.sort || req.session.data.sort

    const filters = [
      'cycle',
      'status',
      'provider',
      'accreditedBody',
      'keywords',
      'location',
      'studyMode',
      'subject',
      'assignedUser',
      'daysLeftToMakeDecisionItem',
      'dateReceivedItem',
      'feedbackItem',
      'note'
    ]

    if (req.query.referrer === 'overview') {
      filters.forEach(filter => {
        if (req.query[filter]) {
          req.session.data[filter] = req.query[filter]
        } else {
          req.session.data[filter] = null
        }
        req.query[filter] = null
      })
    }

    let apps = req.session.data.applications.map(app => app).reverse()

    // for use in the filters
    const users = req.session.data.users.filter(user => {
      return user.organisation.id === req.session.data.user.organisation.id
    })

    let { cycle, status, provider, accreditedBody, keywords, location, studyMode, subject, assignedUser, daysLeftToMakeDecisionItem, dateReceivedItem, noteItem, feedbackItem } = req.query

    keywords = keywords || req.session.data.keywords

    const cycles = getCheckboxValues(cycle, req.session.data.cycle)
    const statuses = getCheckboxValues(status, req.session.data.status)
    const providers = getCheckboxValues(provider, req.session.data.provider)
    const locations = getCheckboxValues(location, req.session.data.location)
    const accreditedBodies = getCheckboxValues(accreditedBody, req.session.data.accreditedBody)
    const studyModes = getCheckboxValues(studyMode, req.session.data.studyMode)
    const subjects = getCheckboxValues(subject, req.session.data.subject)
    const assignedUsers = getCheckboxValues(assignedUser, req.session.data.assignedUser)
    const daysLeftToMakeDecisionItems = getCheckboxValues(daysLeftToMakeDecisionItem, req.session.data.daysLeftToMakeDecisionItem)
    const dateReceivedItems = getCheckboxValues(dateReceivedItem, req.session.data.dateReceivedItem)
    const feedbackItems = getCheckboxValues(feedbackItem, req.session.data.feedbackItem)
    const noteItems = getCheckboxValues(noteItem, req.session.data.noteItem)

    const hasSearch = !!((keywords))

    const hasFilters = !!((cycles && cycles.length > 0) || (statuses && statuses.length > 0) || (locations && locations.length > 0) || (providers && providers.length > 0) || (accreditedBodies && accreditedBodies.length > 0) || (studyModes && studyModes.length > 0) || (subjects && subjects.length > 0) || (assignedUsers && assignedUsers.length > 0) || (daysLeftToMakeDecisionItems && daysLeftToMakeDecisionItems.length > 0) || (dateReceivedItems && dateReceivedItems.length > 0) || (noteItems && noteItems.length > 0 || (feedbackItems && feedbackItems.length > 0)))

    if (hasSearch) {
      apps = apps.filter((app) => {
        let candidateNameValid = true
        let applicationReferenceValid = true
        let matchesNoteValid = true

        const candidateName = `${app.personalDetails.givenName} ${app.personalDetails.familyName}`
        const applicationReference = '' + app.id

        if (keywords) {
          candidateNameValid = candidateName.toLowerCase().includes(keywords.toLowerCase())
          applicationReferenceValid = applicationReference.includes(keywords.toLowerCase())
          matchesNoteValid = app.notes.items.length && app.notes.items[0].message.toLowerCase().includes(keywords.toLowerCase())
        }

        return candidateNameValid || applicationReferenceValid || matchesNoteValid
      })
    }

    if (hasFilters) {
      apps = apps.filter((app) => {
        let cycleValid = true
        let statusValid = true
        let providerValid = true
        let locationValid = true
        let accreditedBodyValid = true
        let studyModeValid = true
        let subjectValid = true
        let assignedUserValid = true
        let unassignedUserValid = true
        let daysLeftToMakeDecisionItemValid = true
        let dateReceivedItemValid = true
        let noteItemValid = true
        let feedbackItemValid = true

        if (cycles && cycles.length) {
          cycleValid = cycles.includes(app.cycle)
        }

        if (statuses && statuses.length) {
          statusValid = statuses.includes(app.status)
        }

        if (locations && locations.length) {
          locationValid = locations.includes(app.location.name)
        }

        if (providers && providers.length) {
          providerValid = providers.includes(app.provider)
        }

        if (accreditedBodies && accreditedBodies.length) {
          accreditedBodyValid = accreditedBodies.includes(app.accreditedBody)
        }

        if (assignedUsers && assignedUsers.length) {
          const appAssignedUserIds = app.assignedUsers.map((user) => {
            return user.id
          })

          // [1] the user selected unassigned from the filter and the application
          // has no assigned users
          if (assignedUsers.includes('unassigned') && appAssignedUserIds.length === 0) {
            unassignedUserValid = (appAssignedUserIds.length === 0)
          }
          // [2] the user selected some assigned users from the filter and the
          // application has that person in their assigned list
          else {
            for (let i = 0; i < assignedUsers.length; i++) {
              assignedUserValid = appAssignedUserIds.includes(assignedUsers[i])
              if (assignedUserValid) {
                break
              }
            }
          }
        }

        if (subjects && subjects.length) {
          const appSubjects = app.subject.map(subject => { return subject.name })

          for (let i = 0; i < subjects.length; i++) {
            subjectValid = appSubjects.includes(subjects[i])
            if (subjectValid) {
              break
            }
          }
        }

        if (studyModes && studyModes.length) {
          studyModeValid = studyModes.includes(app.studyMode)
        }

        if (daysLeftToMakeDecisionItems && daysLeftToMakeDecisionItems.length) {
          daysLeftToMakeDecisionItemValid = false

          if (daysLeftToMakeDecisionItems.includes('5 days or fewer')) {
            if ((app.status === 'Received' || app.status === 'Shortlisted' || app.status === 'Interviewing') && app.daysToRespond <= 5) {
              daysLeftToMakeDecisionItemValid = true
            }
          }

          if (daysLeftToMakeDecisionItems.includes('More than 5 days')) {
            if ((app.status === 'Received' || app.status === 'Shortlisted' || app.status === 'Interviewing') && app.daysToRespond > 5) {
              daysLeftToMakeDecisionItemValid = true
            }
          }
        }

        if (dateReceivedItems && dateReceivedItems.length) {
          dateReceivedItemValid = false

          const submittedDate = DateTime.fromISO(app.submittedDate)

          // Received today
          if (dateReceivedItems.includes('Today')) {
            if (submittedDate.diffNow('days').days >= -1) {
              dateReceivedItemValid = true
            }
          }

          // Received today
          if (dateReceivedItems.includes('Yesterday')) {
            if (submittedDate.diffNow('days').days >= -2) {
              dateReceivedItemValid = true
            }
          }

          // received within last 3 days
          if (dateReceivedItems.includes('2 days ago')) {
            if (submittedDate.diffNow('days').days >= -3) {
              dateReceivedItemValid = true
            }
          }

          // received within last 3 days
          if (dateReceivedItems.includes('3 days ago')) {
            if (submittedDate.diffNow('days').days >= -4) {
              dateReceivedItemValid = true
            }
          }
        }

        if (feedbackItems && feedbackItems.length) {
          feedbackItemValid = false

          if (feedbackItems.includes('Needs feedback')) {
            if (app.status === 'Rejected' && !app.rejectedReasons) {
              feedbackItemValid = true
            }
          }

          if (feedbackItems.includes('Does not need feedback')) {
            if (app.status === 'Rejected' && app.rejectedReasons) {
              feedbackItemValid = true
            }
          }
        }

        if (noteItems && noteItems.length) {
          noteItemValid = false

          if (noteItems.includes('Has note') && app.notes.items.length) {
            noteItemValid = true
          }

          if (noteItems.includes('Does not have note') && app.notes.items.length === 0) {
            noteItemValid = true
          }
        }

        return cycleValid &&
          statusValid &&
          locationValid &&
          providerValid &&
          accreditedBodyValid &&
          studyModeValid &&
          subjectValid &&
          assignedUserValid &&
          unassignedUserValid &&
          daysLeftToMakeDecisionItemValid &&
          dateReceivedItemValid &&
          noteItemValid &&
          feedbackItemValid
      })
    }

    let selectedFilters = null
    if (hasFilters) {
      selectedFilters = {
        categories: []
      }

      if (cycles && cycles.length) {
        selectedFilters.categories.push({
          heading: { text: 'Recruitment cycle' },
          items: cycles.map((cycle) => {
            return {
              text: CycleHelper.getCycleLabel(cycle),
              href: `/applications/remove-cycle-filter/${cycle}`
            }
          })
        })
      }

      if (dateReceivedItems && dateReceivedItems.length) {
        selectedFilters.categories.push({
          heading: { text: 'Date received' },
          items: dateReceivedItems.map((dateReceivedItem) => {
            return {
              text: dateReceivedItem,
              href: `/applications/remove-dateReceivedItem-filter/${dateReceivedItem}`
            }
          })
        })
      }

      if (daysLeftToMakeDecisionItems && daysLeftToMakeDecisionItems.length) {
        selectedFilters.categories.push({
          heading: { text: 'Days to make decision' },
          items: daysLeftToMakeDecisionItems.map((daysLeftToMakeDecisionItem) => {
            return {
              text: daysLeftToMakeDecisionItem,
              href: `/applications/remove-daysLeftToMakeDecisionItem-filter/${daysLeftToMakeDecisionItem}`
            }
          })
        })
      }

      if (feedbackItems && feedbackItems.length) {
        selectedFilters.categories.push({
          heading: { text: 'Rejection feedback' },
          items: feedbackItems.map((feedbackItem) => {
            return {
              text: feedbackItem,
              href: `/applications/remove-feedbackItem-filter/${feedbackItem}`
            }
          })
        })
      }

      if (statuses && statuses.length) {
        selectedFilters.categories.push({
          heading: { text: 'Statuses' },
          items: statuses.map((status) => {
            return {
              text: status,
              href: `/applications/remove-status-filter/${status}`
            }
          })
        })
      }

      if (locations && locations.length) {
        selectedFilters.categories.push({
          // TODO: check this works for multi-organisation user relationships
          heading: { text: 'Training locations for ' + req.session.data.trainingProviders[0].name },
          items: locations.map((location) => {
            return {
              text: location,
              href: `/applications/remove-location-filter/${location}`
            }
          })
        })
      }

      if (providers && providers.length) {
        selectedFilters.categories.push({
          heading: { text: 'Training provider' },
          items: providers.map((provider) => {
            return {
              text: provider,
              href: `/applications/remove-provider-filter/${provider}`
            }
          })
        })
      }

      if (accreditedBodies && accreditedBodies.length) {
        selectedFilters.categories.push({
          heading: { text: 'Accredited body' },
          items: accreditedBodies.map((accreditedBody) => {
            return {
              text: accreditedBody,
              href: `/applications/remove-accreditedBody-filter/${accreditedBody}`
            }
          })
        })
      }

      if (assignedUsers && assignedUsers.length) {
        selectedFilters.categories.push({
          heading: { text: 'Assigned user' },
          items: assignedUsers.map((assignedUser) => {
            return {
              text: getUserFullName(users, assignedUser),
              href: `/applications/remove-assignedUser-filter/${assignedUser}`
            }
          })
        })
      }

      if (subjects && subjects.length) {
        selectedFilters.categories.push({
          heading: { text: 'Subjects' },
          items: subjects.map((subject) => {
            return {
              text: subject,
              href: `/applications/remove-subject-filter/${subject}`
            }
          })
        })
      }

      if (studyModes && studyModes.length) {
        selectedFilters.categories.push({
          heading: { text: 'Full time or part time' },
          items: studyModes.map((studyMode) => {
            return {
              text: studyMode,
              href: `/applications/remove-studyMode-filter/${studyMode}`
            }
          })
        })
      }

      if (noteItems && noteItems.length) {
        selectedFilters.categories.push({
          heading: { text: 'Notes' },
          items: noteItems.map((noteItem) => {
            return {
              text: noteItem,
              href: `/applications/remove-noteItem-filter/${noteItem}`
            }
          })
        })
      }
    }

    // TODO: clean up
    // let applications = apps;

    // let allApplications = applications;

    // Whack all the grouped items into an array without headings
    // let grouped = getApplicationsByGroup(applications)

    // Put groups into ordered array
    // applications = flattenGroup(grouped)

    const allApplications = applications = sortApplications(apps, sort)

    // Get the pagination data
    const pagination = PaginationHelper.getPagination(applications, req.query.page)

    // Get a slice of the data to display
    applications = PaginationHelper.getDataByPage(applications, pagination.pageNumber)

    const cycleItems = CycleHelper.getCycleOptions(req.session.data.cycle)

    const subjectItems = getSubjectItems(req.session.data.subject)
    const selectedSubjects = getSelectedSubjectItems(subjectItems.filter(subject => subject.checked === 'checked'))

    const userItems = getUserItems(users, req.session.data.assignedUser, req.session.data.user)
    const selectedUsers = getSelectedUserItems(userItems.filter(user => user.checked === true))

    // now mixin the headings
    // grouped = getApplicationsByGroup(applications)
    // applications = addHeadings(grouped)

    const trainingProviderItems = getTrainingProviderItems(req.session.data.trainingProviders, req.session.data.provider)
    const accreditedBodyItems = getAccreditedBodyItems(req.session.data.accreditedBodies, req.session.data.accreditedBody)
    const locationItems = getLocationItems(req.session.data.location)
    const statusCheckboxItems = getStatusCheckboxItems(req.session.data.status)
    const daysLeftToMakeDecisionCheckboxItems = getDaysLeftToMakeDecisionCheckboxItems(req.session.data.daysLeftToMakeDecisionItem)
    const dateReceivedCheckboxItems = getDateReceivedCheckboxItems(req.session.data.dateReceivedItem)
    const feedbackCheckboxItems = getFeedbackCheckboxItems(req.session.data.feedbackItem)
    const noteCheckboxItems = getNoteCheckboxItems(req.session.data.noteItem)

    res.render('applications/index', {
      allApplications,
      applications,
      pagination,
      selectedFilters,
      hasFilters,
      subjectItems,
      trainingProviderItems,
      accreditedBodyItems,
      locationItems,
      subjectItemsDisplayLimit: 15,
      selectedSubjects,
      userItems,
      userItemsDisplayLimit: 15,
      selectedUsers,
      cycleItems,
      statusCheckboxItems,
      dateReceivedCheckboxItems,
      daysLeftToMakeDecisionCheckboxItems,
      feedbackCheckboxItems,
      noteCheckboxItems
    })
  })

  router.get('/applications/remove-keywords-search', (req, res) => {
    req.session.data.keywords = ''
    res.redirect('/applications')
  })

  router.get('/applications/remove-cycle-filter/:cycle', (req, res) => {
    req.session.data.cycle = removeFilter(req.params.cycle, req.session.data.cycle)
    res.redirect('/applications')
  })

  router.get('/applications/remove-status-filter/:status', (req, res) => {
    req.session.data.status = removeFilter(req.params.status, req.session.data.status)
    res.redirect('/applications')
  })

  router.get('/applications/remove-provider-filter/:provider', (req, res) => {
    req.session.data.provider = removeFilter(req.params.provider, req.session.data.provider)
    res.redirect('/applications')
  })

  router.get('/applications/remove-location-filter/:location', (req, res) => {
    req.session.data.location = removeFilter(req.params.location, req.session.data.location)
    res.redirect('/applications')
  })

  router.get('/applications/remove-accreditedBody-filter/:accreditedBody', (req, res) => {
    req.session.data.accreditedBody = removeFilter(req.params.accreditedBody, req.session.data.accreditedBody)
    res.redirect('/applications')
  })

  router.get('/applications/remove-subject-filter/:subject', (req, res) => {
    req.session.data.subject = removeFilter(req.params.subject, req.session.data.subject)
    res.redirect('/applications')
  })

  router.get('/applications/remove-studyMode-filter/:studyMode', (req, res) => {
    req.session.data.studyMode = removeFilter(req.params.studyMode, req.session.data.studyMode)
    res.redirect('/applications')
  })

  router.get('/applications/remove-assignedUser-filter/:assignedUser', (req, res) => {
    req.session.data.assignedUser = removeFilter(req.params.assignedUser, req.session.data.assignedUser)
    res.redirect('/applications')
  })

  router.get('/applications/remove-daysLeftToMakeDecisionItem-filter/:daysLeftToMakeDecisionItem', (req, res) => {
    req.session.data.daysLeftToMakeDecisionItem = removeFilter(req.params.daysLeftToMakeDecisionItem, req.session.data.daysLeftToMakeDecisionItem)
    res.redirect('/applications')
  })

  router.get('/applications/remove-dateReceivedItem-filter/:dateReceivedItem', (req, res) => {
    req.session.data.dateReceivedItem = removeFilter(req.params.dateReceivedItem, req.session.data.dateReceivedItem)
    res.redirect('/applications')
  })

  router.get('/applications/remove-noteItem-filter/:noteItem', (req, res) => {
    req.session.data.noteItem = removeFilter(req.params.noteItem, req.session.data.noteItem)
    res.redirect('/applications')
  })

  router.get('/applications/remove-feedbackItem-filter/:feedbackItem', (req, res) => {
    req.session.data.feedbackItem = removeFilter(req.params.feedbackItem, req.session.data.feedbackItem)
    res.redirect('/applications')
  })

  router.get('/applications/remove-all-filters', (req, res) => {
    req.session.data.cycle = null
    req.session.data.daysLeftToMakeDecisionItem = null
    req.session.data.dateReceivedItem = null
    req.session.data.feedbackItem = null
    req.session.data.noteItem = null
    req.session.data.status = null
    req.session.data.provider = null
    req.session.data.accreditedBody = null
    req.session.data.location = null
    req.session.data.subject = null
    req.session.data.studyMode = null
    req.session.data.assignedUser = null
    res.redirect('/applications')
  })
}
