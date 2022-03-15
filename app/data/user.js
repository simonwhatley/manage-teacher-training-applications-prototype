const OrgHelper = require('./helpers/organisation')
const users = require('./users.json')
const relationships = require('./relationships-north-wiltshire-scitt')

// set up user orgs
let userOrgs = [];
userOrgs.push(OrgHelper.findOrg('North Wiltshire SCITT'))

// create user object
let user = users[0] // we know the first one is the test participant
user.organisations = userOrgs

// put relationships onto the user
user.relationships = relationships

module.exports = user
