const ApplicationHelper = require('../data/helpers/application')

function getOrganisationPermission(org, relationships) {
  var permissions = {
    applicableOrgs: {
      setupInterviews: [],
      makeDecisions: [],
      viewSafeguardingInformation: [],
      viewDiversityInformation: []
    },
    nonApplicableOrgs: {
      setupInterviews: [],
      makeDecisions: [],
      viewSafeguardingInformation: [],
      viewDiversityInformation: []
    }
  }
  relationships.filter(relationship => {
    return relationship.org1.id === org.id || relationship.org2.id === org.id
  }).forEach(relationship => {
    var orgKey = relationship.org1.id == org.id ? 'org2' : 'org1';
    let permissionsKey = relationship.org1.id == org.id ? 'org1Permissions' : 'org2Permissions';

    if(relationship[permissionsKey].setupInterviews) {
      permissions.applicableOrgs.setupInterviews.push(relationship[orgKey])
    } else {
      permissions.nonApplicableOrgs.setupInterviews.push(relationship[orgKey])
    }

    if(relationship[permissionsKey].makeDecisions) {
      permissions.applicableOrgs.makeDecisions.push(relationship[orgKey])
    } else {
      permissions.nonApplicableOrgs.makeDecisions.push(relationship[orgKey])
    }

    if(relationship[permissionsKey].viewSafeguardingInformation) {
      permissions.applicableOrgs.viewSafeguardingInformation.push(relationship[orgKey])
    } else {
      permissions.nonApplicableOrgs.viewSafeguardingInformation.push(relationship[orgKey])
    }

    if(relationship[permissionsKey].viewDiversityInformation) {
      permissions.applicableOrgs.viewDiversityInformation.push(relationship[orgKey])
    } else {
      permissions.nonApplicableOrgs.viewDiversityInformation.push(relationship[orgKey])
    }

  })
  return permissions
}

module.exports = router => {

  router.get('/organisation-settings/:orgId/users', (req, res) => {
    let org = req.session.data.organisations.find(org => org.id == req.params.orgId)
    let users = req.session.data.users.filter(user => user.organisation.id == req.params.orgId)
    res.render('organisation-settings/users/index', {
      org,
      users
    })
  })

  router.get('/organisation-settings/:orgId/users/new', (req, res) => {
    let org = req.session.data.user.organisations.find(org => req.params.orgId == org.id)
    res.render('organisation-settings/users/new/index', {
      org
    })
  })

  router.post('/organisation-settings/:orgId/users/new', (req, res) => {
    res.redirect(`/organisation-settings/${req.params.orgId}/users/new/permissions/`)
  })

  router.get('/organisation-settings/:orgId/users/new/permissions/', (req, res) => {
    let org = req.session.data.user.organisations.find(org => req.params.orgId == org.id)
    res.render('organisation-settings/users/new/permissions', {
      org
    })
  })

  router.post('/organisation-settings/:orgId/users/new/permissions/', (req, res) => {
    if(req.session.data.newuser.access == "Additional permissions") {
      res.redirect(`/organisation-settings/${req.params.orgId}/users/new/additional-permissions`)
    } else {
      res.redirect(`/organisation-settings/${req.params.orgId}/users/new/check`)
    }
  })

  router.get('/organisation-settings/:orgId/users/new/additional-permissions', (req, res) => {
    let org = req.session.data.user.organisations.find(org => req.params.orgId == org.id)
    let permissions = getOrganisationPermission(org, req.session.data.relationships)

    res.render('organisation-settings/users/new/additional-permissions', {
      org,
      permissions
    })
  })

  router.post('/organisation-settings/:orgId/users/new/additional-permissions', (req, res) => {
    res.redirect(`/organisation-settings/${req.params.orgId}/users/new/check`)
  })

  router.get('/organisation-settings/:orgId/users/new/check', (req, res) => {
    let org = req.session.data.user.organisations.find(org => req.params.orgId == org.id)
    res.render('organisation-settings/users/new/check', {
      org
    })
  })

  router.post('/organisation-settings/:orgId/users/new/check', (req, res) => {
    req.flash('success', 'User invited')
    res.redirect(`/organisation-settings/${req.params.orgId}/users/`)
  })

  // Details

  router.get('/organisation-settings/:orgId/users/:userId', (req, res) => {
    let user = req.session.data.users.find(user => user.id == req.params.userId)
    let org = req.session.data.organisations.find(org => org.id == req.params.orgId)
    res.render('organisation-settings/users/show', { user, org, permissions: getOrganisationPermission(org, req.session.data.relationships) })
  })

  // Edit permissions

  router.get('/organisation-settings/:orgId/users/:userId/permissions/edit', (req, res) => {
    var user = req.session.data.users.find(user => user.id == req.params.userId)
    var org = req.session.data.organisations.find(org => req.params.orgId == org.id)
    res.render('organisation-settings/users/edit-permissions/permissions', {
      user,
      org
    })
  })


  router.post('/organisation-settings/:orgId/users/:userId/permissions/edit', (req, res) => {
    if(req.session.data.editpermissions.access == "Additional permissions") {
      res.redirect(`/organisation-settings/${req.params.orgId}/users/${req.params.userId}/permissions/edit/additional-permissions`)
    } else {
      res.redirect(`/organisation-settings/${req.params.orgId}/users/${req.params.userId}/permissions/edit/check`)
    }
  })

  router.get('/organisation-settings/:orgId/users/:userId/permissions/edit/additional-permissions', (req, res) => {
    let user = req.session.data.users.find(user => user.id == req.params.userId)
    let org = req.session.data.organisations.find(org => req.params.orgId == org.id)
    let permissions = getOrganisationPermission(org, req.session.data.relationships)

    res.render('organisation-settings/users/edit-permissions/additional-permissions', {
      user,
      org,
      permissions
    })
  })

  router.post('/organisation-settings/:orgId/users/:userId/permissions/edit/additional-permissions', (req, res) => {
    res.redirect(`/organisation-settings/${req.params.orgId}/users/${req.params.userId}/permissions/edit/check`)
  })

  router.get('/organisation-settings/:orgId/users/:userId/permissions/edit/check', (req, res) => {
    let user = req.session.data.users.find(user => user.id == req.params.userId)
    let org = req.session.data.organisations.find(org => req.params.orgId == org.id)
    res.render('organisation-settings/users/edit-permissions/check', {
      user,
      org
    })
  })

  router.post('/organisation-settings/:orgId/users/:userId/permissions/edit/check', (req, res) => {
    req.flash('success', 'Permissions updated')
    res.redirect(`/organisation-settings/${req.params.orgId}/users/${req.params.userId}`)
  })

  // Delete user

  router.get('/organisation-settings/:orgId/users/:userId/delete', (req, res) => {
    var user = req.session.data.users.find(user => user.id == req.params.userId)
    let org = req.session.data.organisations.find(org => org.id == req.params.orgId)
    res.render('organisation-settings/users/delete', { user, org })
  })

  router.post('/organisation-settings/:orgId/users/:userId/delete', (req, res) => {
    req.flash('success', 'Access removed')
    res.redirect(`/organisation-settings/${req.params.orgId}/users`)
  })

  router.get('/account/personal-details', (req, res) => {
    var user = req.session.data.users[0]

    res.render('account/personal-details', { user })
  })

  router.get('/account/permissions', (req, res) => {
    let user = req.session.data.user

    let orgs = user.organisations.map(org => {
      // add permissions in for each org

      return {
        org: org,
        permissions: getOrganisationPermission(org, req.session.data.relationships)
      }

    })

    res.render('account/permissions', { user, orgs })
  })

}
