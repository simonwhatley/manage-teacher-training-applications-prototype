const { fakerEN_GB: faker } = require('@faker-js/faker')
const { DateTime } = require('luxon')
const SystemHelper = require('../helpers/system')

function getInterview (params) {
  const now = SystemHelper.now().set({
    hour: faker.helpers.arrayElement([9, 10, 11]),
    minute: faker.helpers.arrayElement([0, 15, 30, 45])
  })
  const past = now.minus({ days: faker.number.int({ min: 1, max: 20 }) }).set({
    hour: faker.helpers.arrayElement([9, 10, 11]),
    minute: faker.helpers.arrayElement([0, 15, 30, 45])
  })
  const future = now.plus({ days: faker.number.int({ min: 0, max: 10 }) }).set({
    hour: faker.helpers.arrayElement([9, 10, 11]),
    minute: faker.helpers.arrayElement([0, 15, 30, 45])
  })

  const interview = {}
  interview.id = faker.string.uuid()
  interview.details = faker.helpers.arrayElement([faker.lorem.sentence(20), ''])

  interview.location = faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.zipCode()

  interview.organisation = faker.helpers.arrayElement(['The Royal Borough Teaching School Alliance', 'Kingston University'])

  if (params.status === 'Interviewing') {
    interview.date = faker.helpers.arrayElement([past, future, now, now.plus({ days: 1 })])
    if (faker.helpers.arrayElement(['has interviews', '']) == 'has interviews') {
      return interview
    }
  } else {
    interview.date = past
    return interview
  }
}

module.exports = (params) => {
  const interviews = { items: [] }

  if (params.status === 'Received') {
    return interviews
  }

  const interview1 = getInterview(params)

  if (interview1) {
    interviews.items.push(interview1)
  }

  const interview2 = getInterview(params)

  if (interview2) {
    interviews.items.push(interview2)
  }

  return interviews
}
