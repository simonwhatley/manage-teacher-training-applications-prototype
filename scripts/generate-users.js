const fs = require('fs')
const path = require('path')
const { fakerEN_GB: faker } = require('@faker-js/faker')

const generatorHelpers = require('../app/data/helpers/generators')
const OrgHelper = require('../app/data/helpers/organisation')
const generateUser = require('../app/data/generators/user')

const generateFakeUser = (params = {}) => {
  return generateUser(faker, params)
}

const generateFakeUsers = (count) => {
  const organisations = require('../app/data/organisations.json')
  const users = []
  // const mainOrg = OrgHelper.findOrg('The Millais Alliance')
  const mainOrg = OrgHelper.findOrg('Oxford University')

  const firstName = 'Matt'
  const lastName = 'Hurst'
  const emailAddress = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${mainOrg.domain}`

  users.push({
    id: faker.datatype.uuid(),
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    organisation: mainOrg,
    permissions: {
      manageOrganisation: true,
      manageUsers: true,
      setupInterviews: true,
      makeDecisions: true,
      viewSafeguardingInformation: true,
      viewDiversityInformation: true
    }
  })

  organisations.forEach(organisation => {
    for(var i = 0; i < 5; i++) {
      let firstName = generatorHelpers.firstName(faker.helpers.randomize([0,1]))
      let lastName = generatorHelpers.lastName()
      users.push({
        id: faker.datatype.uuid(),
        firstName,
        lastName,
        emailAddress: `${firstName.replace(/\s/g, '').toLowerCase()}.${lastName.toLowerCase()}@${organisation.domain}`,
        organisation,
        permissions: {
          manageOrganisation: faker.helpers.randomize([true, false]),
          manageUsers: faker.helpers.randomize([true, false]),
          setupInterviews: faker.helpers.randomize([true, false]),
          makeDecisions: faker.helpers.randomize([true, false]),
          viewSafeguardingInformation: faker.helpers.randomize([true, false]),
          viewDiversityInformation: faker.helpers.randomize([true, false])
        }
      })
    }
  })

  return users
}

const generateUsersFile = (filePath) => {
  const users = generateFakeUsers()
  const filedata = JSON.stringify(users, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      console.log(`User data generated: ${filePath}`)
    }
  )
}

generateUsersFile(path.join(__dirname, '../app/data/users.json'))
