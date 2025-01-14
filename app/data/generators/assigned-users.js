const { fakerEN_GB: faker } = require('@faker-js/faker')

const _ = require('lodash')

const users = require('../users.json')

module.exports = (accreditedBody, provider, status) => {
  const assignedUsers = []

  // if the application is not received, assign a user from the
  // accredited body and training provider
  if (status.toLowerCase() !== 'received') {
    // add one or many users for accredited body
    const accreditedBodyUsers = users.filter(user => {
      return user.organisation.id === accreditedBody.id
    })

    const accreditedBodyUserCount = faker.number.int({ min: 1, max: 3 })

    for (let i = 0; i < accreditedBodyUserCount; i++) {
      let accreditedBodyUser = {}

      accreditedBodyUser = faker.helpers.arrayElement(accreditedBodyUsers)

      // clone the users so we can clean the data and only use what we need
      accreditedBodyUser = _.cloneDeep(accreditedBodyUser)

      // remove unnecessary data
      delete accreditedBodyUser.organisations
      delete accreditedBodyUser.permissions

      const hasAssignedUser = !!assignedUsers.find(user => user.id === accreditedBodyUser.id)

      if (!hasAssignedUser) {
        assignedUsers.push(accreditedBodyUser)
      }
    }

    // add one or many users for training provider
    const providerUsers = users.filter(user => {
      return user.organisation.id === provider.id
    })

    const providerUserCount = faker.number.int({ min: 1, max: 3 })

    for (let i = 0; i < providerUserCount; i++) {
      let providerUser = {}

      providerUser = faker.helpers.arrayElement(providerUsers)

      // clone the users so we can clean the data and only use what we need
      providerUser = _.cloneDeep(providerUser)

      // remove unnecessary data
      delete providerUser.organisations
      delete providerUser.permissions

      const hasAssignedUser = !!assignedUsers.find(user => user.id === providerUser.id)

      if (!hasAssignedUser) {
        assignedUsers.push(providerUser)
      }
    }
  }

  return assignedUsers
}
