const OrgHelper = require('./helpers/organisation')
const relationships = []
const userOrg = OrgHelper.findOrg('University of Leicester')

relationships.push({
  id: 1,
  org1: userOrg,
  org1Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: false,
    viewDiversityInformation: true
  },
  org2: OrgHelper.findOrg('Ashlawn Teaching School'),
  org2Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: false,
    viewDiversityInformation: false
  }
})
relationships.push({
  id: 2,
  org1: userOrg,
  org1Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: false,
    viewDiversityInformation: true
  },
  org2: OrgHelper.findOrg('The Beauchamp Lionheart Training Partnership'),
  org2Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: true,
    viewDiversityInformation: false
  }
})
relationships.push({
  id: 3,
  org1: userOrg,
  org1Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: false,
    viewDiversityInformation: false
  },
  org2: OrgHelper.findOrg('President Kennedy Teaching School Alliance'),
  org2Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: true,
    viewDiversityInformation: true
  }
})
relationships.push({
  id: 4,
  org1: userOrg,
  org1Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: false,
    viewDiversityInformation: true
  },
  org2: OrgHelper.findOrg('Southam Teaching Alliance'),
  org2Permissions: {
    makeDecisions: true,
    viewSafeguardingInformation: true,
    viewDiversityInformation: true
  }
})

// if the user belongs to multiple orgs for each additional org set up relationships like his
// relationships.push({
//   id: 5,
//   org1: OrgHelper.findOrg("Second org name"),
//   org1Permissions: {
//     makeDecisions: true,
//     viewSafeguardingInformation: false,
//     viewDiversityInformation: true
//   },
//   org2: OrgHelper.findOrg("Southam Teaching Alliance"),
//   org2Permissions: {
//     makeDecisions: true,
//     viewSafeguardingInformation: true,
//     viewDiversityInformation: true
//   }
// })

// relationships.push({
//   id: 5,
//   org1: OrgHelper.findOrg("Second org name"),
//   org1Permissions: {
//     makeDecisions: true,
//     viewSafeguardingInformation: false,
//     viewDiversityInformation: true
//   },
//   org2: OrgHelper.findOrg("Southam Teaching Alliance x"),
//   org2Permissions: {
//     makeDecisions: true,
//     viewSafeguardingInformation: true,
//     viewDiversityInformation: true
//   }
// })

module.exports = relationships
