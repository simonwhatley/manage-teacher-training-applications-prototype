const OrgHelper = require('./helpers/organisation')
const users = require('./users.json')
// const relationships = require('./relationships-the-millais-alliance')
const relationships = require('./relationships-oxford-university')

// set up user orgs
const userOrgs = []
// userOrgs.push(OrgHelper.findOrg('The Millais Alliance'))
userOrgs.push(OrgHelper.findOrg('Oxford University'))

// create user object
const user = users[0] // we know the first one is the test participant
user.organisations = userOrgs

// put relationships onto the user
user.relationships = relationships

module.exports = user
