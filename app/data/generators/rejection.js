const faker = require('faker')
faker.locale = 'en_GB'

function buildReasons(params) {

  let reasons = {
    categories: []
  }

  if(params.qualifications) {
    reasons.categories.push('Qualifications')

    reasons['qualifications-reasons'] = [
      'No English GCSE grade 4 (C) or above, or accepted equivalent',
      'Degree does not meet course requirements',
      'Other'
    ]

    if(reasons['qualifications-reasons'].find(item => 'Degree does not meet course requirements')) {
      reasons['qualifications-reasons-degree-does-not-meet-course-requirements'] = faker.lorem.paragraph(1)
    }


    if(reasons['qualifications-reasons'].find(item => 'Other')) {
      reasons['qualifications-reasons-other'] = faker.lorem.paragraph(1)
    }

  }

  if(params.personalStatement) {
    reasons.categories.push('Personal statement')

    reasons['personal-statement-reasons'] = [
      'Quality of writing',
      'Other'
    ]

    if(reasons['personal-statement-reasons'].find(item => 'Quality of writing')) {
      reasons['personal-statement-reasons-quality-of-writing'] = faker.lorem.paragraph(1)
    }

    if(reasons['personal-statement-reasons'].find(item => 'Other')) {
      reasons['personal-statement-reasons-other'] = faker.lorem.paragraph(1)
    }

  }

  return reasons;

}

module.exports = () => {

  let qualifications = buildReasons({
    qualifications: true
  })

  let personalStatement = buildReasons({
    personalStatement: true
  })

  let all = buildReasons({
    qualifications: true,
    personalStatement: true
  })

  return faker.helpers.randomize([all, qualifications, personalStatement, null])


}
