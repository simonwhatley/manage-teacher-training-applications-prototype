const PaginationHelper = require('../data/helpers/pagination')
const ApplicationHelper = require('../data/helpers/application')
const CycleHelper = require('../data/helpers/cycles')

const subjects = require('../data/subjects')
const locations = require('../data/locations')
const { default: request } = require('sync-request')

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

  items.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

const getStatusItems = (selectedItems) => {
  const items = []

  const statuses = ['Received', 'Interviewing', 'Offered', 'Conditions pending', 'Recruited', 'Deferred', 'Conditions not met', 'Declined', 'Rejected', 'Application withdrawn', 'Offer withdrawn']

  statuses.forEach((status, i) => {
    const item = {}

    item.text = status
    item.value = status
    item.checked = (selectedItems && selectedItems.includes(status)) ? 'checked' : ''

    items.push(item)
  })
  return items
}

const getSelectedSubjectItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const subject = {}
    subject.text = item.text
    subject.href = `/remove-subject-filter/${item.text}`

    items.push(subject)
  })

  return items
}

const getUserItems = (users, assignedUsers = [], you = {}) => {
  let options = []

  // sort the users alphabetically
  users.sort((a, b) => a.firstName.localeCompare(b.firstName)
                        || a.lastName.localeCompare(b.lastName)
                        || a.emailAddress.localeCompare(b.emailAddress))

  users.forEach((user) => {
    const option = {}
    option.id = user.id
    option.value = user.id

    option.text = user.firstName + ' ' + user.lastName
    if (you && you.id === user.id) {
      option.text += ' (you)'
    }

    const hasDuplicateName = users.filter(u => u.firstName === user.firstName && u.lastName === user.lastName).length > 1 ? true : false

    if(hasDuplicateName) {
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
    user.href = `/remove-assignedUser-filter/${item.value}`

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
    .sort((a,b) => {
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
    .sort((a,b) => {
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

  items.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

const sortApplications = (applications) => {
  let newApplications = []

  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Received').sort(function(a, b) {
    return a.daysToRespond - b.daysToRespond
  }))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Interviewing').sort(function(a, b) {
    return a.daysToRespond - b.daysToRespond
  }))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Offered'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Conditions pending'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Recruited'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Deferred'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Rejected'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Application withdrawn'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Offer withdrawn'))
  newApplications = newApplications.concat(applications.filter((app) => app.status == 'Conditions not met'))

  return newApplications


}

const getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name) ? name : [name].filter((name) => {
    return name !== '_unchecked'
  })) || data && (Array.isArray(data) ? data : [data])
}

const removeFilter = (value, data) => {
  // do this check because if coming from overview page for example,
  // the query/param will be a string value, not an array containing a string
  if(Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}

module.exports = router => {

  router.get('/applications', (req, res) => {
    res.redirect('/')
  })

  router.all('/', (req, res) => {

    var filters = [
      'cycle',
      'status',
      'provider',
      'accreditedBody',
      'keywords',
      'location',
      'studyMode',
      'subject',
      'assignedUser',
      'importantItem'
    ]

    if(req.query.referrer === 'overview') {
      filters.forEach(filter => {
        if(req.query[filter]) {
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
      return user.organisation.id == req.session.data.user.organisation.id
    })

    let { cycle, status, provider, accreditedBody, keywords, location, studyMode, subject, assignedUser, importantItem } = req.query

    keywords = keywords || req.session.data.keywords

    const cycles = getCheckboxValues(cycle, req.session.data.cycle)
    const statuses = getCheckboxValues(status, req.session.data.status)
    const providers = getCheckboxValues(provider, req.session.data.provider)
    const locations = getCheckboxValues(location, req.session.data.location)
    const accreditedBodies = getCheckboxValues(accreditedBody, req.session.data.accreditedBody)
    const studyModes = getCheckboxValues(studyMode, req.session.data.studyMode)
    const subjects = getCheckboxValues(subject, req.session.data.subject)
    const assignedUsers = getCheckboxValues(assignedUser, req.session.data.assignedUser)
    const importantItems = getCheckboxValues(importantItem, req.session.data.importantItem)

    const hasSearch = !!((keywords))

    const hasFilters = !!((cycles && cycles.length > 0) || (statuses && statuses.length > 0) || (locations && locations.length > 0) || (providers && providers.length > 0) || (accreditedBodies && accreditedBodies.length > 0) || (studyModes && studyModes.length > 0) || (subjects && subjects.length > 0) || (assignedUsers && assignedUsers.length > 0) || (importantItems && importantItems.length > 0))

    if (hasSearch) {
      apps = apps.filter((app) => {

        let candidateNameValid = true
        let applicationReferenceValid = true
        let noteValid = true

        const candidateName = `${app.personalDetails.givenName} ${app.personalDetails.familyName}`
        const applicationReference = '' + app.id

        if (keywords) {
          candidateNameValid = candidateName.toLowerCase().includes(keywords.toLowerCase())
          applicationReferenceValid = applicationReference.includes(keywords.toLowerCase())
          noteValid = app.notes.items[0].message.toLowerCase().includes(keywords.toLowerCase())
        }

        return candidateNameValid || applicationReferenceValid || noteValid
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
        let importantItemValid = true

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
          if (assignedUsers.includes('unassigned') && appAssignedUserIds.length == 0) {
            unassignedUserValid = (appAssignedUserIds.length == 0)
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

        if (importantItems && importantItems.length) {
          importantItemValid = false

          if(importantItems.includes('5 days or fewer to make decision')) {
            if((app.status == 'Received' || app.status == 'Interviewing') && app.daysToRespond < 5) {
              importantItemValid = true
            }
          }

          if(importantItems.includes('Feedback needed')) {
            if(app.status == 'Rejected' && !app.rejectedReasons) {
              importantItemValid = true
            }
          }
        }

        return cycleValid
          && statusValid
          && locationValid
          && providerValid
          && accreditedBodyValid
          && studyModeValid
          && subjectValid
          && assignedUserValid
          && unassignedUserValid
          && importantItemValid
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
              href: `/remove-cycle-filter/${cycle}`
            }
          })
        })
      }

      if (importantItems && importantItems.length) {
        selectedFilters.categories.push({
          heading: { text: 'Important' },
          items: importantItems.map((importantItem) => {
            return {
              text: importantItem,
              href: `/remove-importantItem-filter/${importantItem}`
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
              href: `/remove-status-filter/${status}`
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
              href: `/remove-location-filter/${location}`
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
              href: `/remove-provider-filter/${provider}`
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
              href: `/remove-accreditedBody-filter/${accreditedBody}`
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
              href: `/remove-assignedUser-filter/${assignedUser}`
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
              href: `/remove-subject-filter/${subject}`
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
              href: `/remove-studyMode-filter/${studyMode}`
            }
          })
        })
      }



    }

    // TODO: clean up
    let applications = apps;

    // let allApplications = applications;

    // Whack all the grouped items into an array without headings
    // let grouped = getApplicationsByGroup(applications)

    // Put groups into ordered array
    // applications = flattenGroup(grouped)

    applications = sortApplications(applications)



    // Get the pagination data
    let pagination = PaginationHelper.getPagination(applications, req.query.page)

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
    const statusItems = getStatusItems(req.session.data.status)

    res.render('index', {
      // allApplications,
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
      statusItems
    })
  })

  router.get('/remove-keywords-search', (req, res) => {
    req.session.data.keywords = ''
    res.redirect('/')
  })

  router.get('/remove-cycle-filter/:cycle', (req, res) => {
    req.session.data.cycle = removeFilter(req.params.cycle, req.session.data.cycle)
    res.redirect('/')
  })

  router.get('/remove-status-filter/:status', (req, res) => {
    req.session.data.status = removeFilter(req.params.status, req.session.data.status)
    res.redirect('/')
  })

  router.get('/remove-provider-filter/:provider', (req, res) => {
    req.session.data.provider = removeFilter(req.params.provider, req.session.data.provider)
    res.redirect('/')
  })

  router.get('/remove-location-filter/:location', (req, res) => {
    req.session.data.location = removeFilter(req.params.location, req.session.data.location)
    res.redirect('/')
  })

  router.get('/remove-accreditedBody-filter/:accreditedBody', (req, res) => {
    req.session.data.accreditedBody = removeFilter(req.params.accreditedBody, req.session.data.accreditedBody)
    res.redirect('/')
  })

  router.get('/remove-subject-filter/:subject', (req, res) => {
    req.session.data.subject = removeFilter(req.params.subject, req.session.data.subject)
    res.redirect('/')
  })

  router.get('/remove-studyMode-filter/:studyMode', (req, res) => {
    req.session.data.studyMode = removeFilter(req.params.studyMode, req.session.data.studyMode)
    res.redirect('/')
  })

  router.get('/remove-assignedUser-filter/:assignedUser', (req, res) => {
    req.session.data.assignedUser = removeFilter(req.params.assignedUser, req.session.data.assignedUser)
    res.redirect('/')
  })

  router.get('/remove-importantItem-filter/:importantItem', (req, res) => {
    req.session.data.importantItem = removeFilter(req.params.importantItem, req.session.data.importantItem)
    res.redirect('/')
  })

  router.get('/remove-all-filters', (req, res) => {
    req.session.data.cycle = null
    req.session.data.importantItem = null
    req.session.data.status = null
    req.session.data.provider = null
    req.session.data.accreditedBody = null
    req.session.data.location = null
    req.session.data.subject = null
    req.session.data.studyMode = null
    req.session.data.assignedUser = null
    res.redirect('/')
  })

}
