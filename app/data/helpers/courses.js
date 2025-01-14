const utils = require('./utils')

const locations = require('../locations')
const courses = require('../courses')
const user = require('../user')
const { createUser } = require('../content')

exports.getProviderRadioOptions = (selectedItem) => {
  const items = []
  const providers = []

  user.organisations.forEach((org) => {
    if (org.isAccreditedBody) {
      const partners = user.relationships.map(relationship => relationship.org2)
      partners.forEach((partner) => {
        providers.push(partner)
      })
    }
  })

  providers.forEach((provider, i) => {
    const item = {}

    item.text = provider.name
    item.value = provider.id
    item.id = provider.id
    item.checked = (selectedItem && selectedItem.includes(provider.id)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getCourseRadioOptions = (selectedItem, trainingProviderId) => {
  const items = []

  let courses = require('../courses')

  if (trainingProviderId) {
    courses = courses.filter((course) => {
      return course.trainingProvider.id === trainingProviderId
    })
  }

  courses.forEach((course, i) => {
    const item = {}

    item.text = course.name
    item.text += ' (' + course.code + ')'
    item.value = course.code
    item.id = course.code
    item.checked = (selectedItem && selectedItem.includes(course.code)) ? 'checked' : ''

    item.hint = {}
    item.hint.text = utils.arrayToList(
      array = course.qualifications,
      join = ', ',
      final = ' with '
    )

    item.hint.text += ' - ' + course.accreditedBody.name

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getCourse = (courseId) => {
  return courses.find(course => course.code === courseId)
}

exports.getCourseStudyModeRadioOptions = (courseId, selectedItem) => {
  const items = []
  const course = courses.find(course => course.code === courseId)

  course.studyModes.forEach((studyMode, i) => {
    const item = {}

    item.text = studyMode
    item.value = studyMode
    item.id = studyMode
    item.checked = (selectedItem && selectedItem.includes(studyMode)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getCourseLocationRadioOptions = (courseId, selectedItem) => {
  const items = []
  const course = courses.find(course => course.code === courseId)

  course.locations.forEach((location, i) => {
    const item = {}

    item.text = location.name
    item.value = location.id
    item.id = location.id
    item.checked = (selectedItem && selectedItem.includes(location.id)) ? 'checked' : ''

    item.hint = {}
    item.hint.text = utils.arrayToList(
      array = Object.values(location.address),
      join = ', ',
      final = ', '
    )

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getCourseLocation = (locationId) => {
  return locations.find(location => location.id === locationId)
}
