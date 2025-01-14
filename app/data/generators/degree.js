const { fakerEN_GB: faker } = require('@faker-js/faker')

const { DateTime } = require('luxon')
const weighted = require('weighted')
const DegreeHelper = require('../helpers/degrees')

module.exports = (params) => {
  // Start year - 18 or 19 years after date of birth
  let year = DateTime.fromISO(params.dateOfBirth).toObject().year
  year += faker.helpers.arrayElement([18, 19])

  const currentYear = DateTime.now().year

  // 80% of candidates have 1 degree
  const count = weighted.select({
    1: 0.8,
    2: 0.2
  })

  const degrees = []

  for (let i = 0; i < count; i++) {
    const degree = {}

    degree.subject = faker.helpers.arrayElement(DegreeHelper.getSubjects())

    // Start year for second degree must be after first
    if (i > 0) {
      degree.startYear = degrees[i - 1].startYear + faker.number.int({ min: 1, max: 10 })
    } else {
      degree.startYear = year
    }

    // Set the graduation year to be between 3 and 4 years after start year
    degree.graduationYear = degree.startYear + faker.number.int({ min: 3, max: 4 })

    // If graduation year is after the current year, set predicted to true
    degree.predicted = (degree.graduationYear > currentYear)

    if (params.isInternationalCandidate) {
      degree.type = 'Diplôme'
      degree.institution = 'University of Paris'
      degree.country = 'France'
      degree.grade = 'Pass'

      degree.naric = {}
      degree.naric.reference = '4000228363'
      degree.naric.comparable = 'Bachelor (Honours) degree'
    } else {
      const qualification = faker.helpers.arrayElement(DegreeHelper.getQualifications())

      degree.level = qualification.level

      degree.grade = faker.helpers.arrayElement([
        'First-class honours',
        'Upper second-class honours (2:1)',
        'Lower second-class honours (2:2)',
        'Third-class honours',
        'Pass',
        ...(degree.level !== 6) ? ['Merit'] : [],
        ...(degree.level !== 6) ? ['Distinction'] : [],
        ...(degree.level !== 6) ? ['Not applicable'] : [],
        ...(degree.level !== 6) ? ['Unknown'] : []
      ])

      degree.type = qualification.text + (degree.grade.includes('honours') ? ' (Hons)' : '')

      degree.institution = faker.helpers.arrayElement(DegreeHelper.getInstitutions())
      degree.country = 'United Kingdom'
    }

    degrees.push(degree)
  }

  // sort the degrees in reverse chronological order
  // degrees.sort((a, b) => {
  //   return b.startYear - a.startYear
  // })

  return degrees
}
