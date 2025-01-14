const path = require('path')
const fs = require('fs')
const { DateTime } = require('luxon')
const _ = require('lodash')
const numeral = require('numeral')

const { CURRENT_CYCLE } = require('./cycles')
const System = require('./system')

const dataDirectoryPath = path.join(__dirname, '../statistics')

exports.getStatusData = (fileName) => {
  if (!fileName) {
    return null
  }
  const filePath = dataDirectoryPath + '/status/' + fileName + '.json'
  const rawData = fs.readFileSync(filePath)
  const data = JSON.parse(rawData)
  return data
}

exports.getAttritionData = (fileName) => {
  if (!fileName) {
    return null
  }
  const filePath = dataDirectoryPath + '/attrition/' + fileName + '.json'
  const rawData = fs.readFileSync(filePath)
  const data = JSON.parse(rawData)
  return data
}

exports.getEthnicityData = (applications) => {
  const ethnicGroups = [
    {
      name: 'Asian or Asian British',
      items: ['Bangladeshi', 'Chinese', 'Indian', 'Pakistani', 'Any other Asian background', 'Prefer not to say']
    },
    {
      name: 'Black, African, Black British or Caribbean',
      items: ['African', 'Caribbean', 'Any other Black, African or Caribbean background', 'Prefer not to say']
    },
    {
      name: 'Mixed or multiple ethnic groups',
      items: ['Asian and White', 'Black African and White', 'Black Caribbean and White', 'Any other Mixed or Multiple ethnic background', 'Prefer not to say']
    },
    {
      name: 'White',
      items: ['British, English, Northern Irish, Scottish, or Welsh', 'Irish', 'Irish Traveller or Gypsy', 'Any other White background', 'Prefer not to say']
    },
    {
      name: 'Another ethnic group',
      items: ['Arab', 'Any other ethnic group', 'Prefer not to say']
    },
    {
      name: 'Prefer not to say'
    }
  ]

  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']

  const apps = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === 'Yes')

  const data = {}
  data.items = []
  data.totals = {}
  data.rates = {}

  data.totals.received = apps.length

  statuses.forEach((status, i) => {
    data.totals[status] = apps.filter(app => app.status === status).length

    data.rates[status] = data.totals.received ? ((data.totals[status] / data.totals.received) * 100) : 0
    data.rates[status] = numeral(data.rates[status]).format('0.[0]')
  })

  ethnicGroups.forEach((group, i) => {
    const parent = {}
    parent.title = group.name
    parent.items = []

    parent.counts = {}
    parent.rates = {}

    parent.counts.received = apps.filter(app => app.personalDetails.ethnicGroup === group.name).length

    statuses.forEach((status, i) => {
      parent.counts[status] = apps.filter(app => app.personalDetails.ethnicGroup === group.name &&
        app.status === status).length

      parent.rates[status] = parent.counts.received ? ((parent.counts[status] / parent.counts.received) * 100) : 0

      parent.rates[status] = numeral(parent.rates[status]).format('0.[0]')
    })

    if (group.items !== undefined) {
      group.items.forEach((item, i) => {
        const child = {}
        child.title = item

        child.counts = {}
        child.rates = {}

        child.counts.received = apps.filter(app => app.personalDetails.ethnicGroup === group.name &&
          app.personalDetails.ethnicBackground === item).length

        statuses.forEach((status, i) => {
          child.counts[status] = apps.filter(app => app.personalDetails.ethnicGroup === group.name &&
            app.personalDetails.ethnicBackground === item &&
            app.status === status).length

          child.rates[status] = child.counts.received ? ((child.counts[status] / child.counts.received) * 100) : 0

          child.rates[status] = numeral(child.rates[status]).format('0.[0]')
        })

        parent.items.push(child)
      })
    }

    data.items.push(parent)
  })

  return data
}

exports.getSexData = (applications) => {
  const options = ['Female', 'Male', 'Intersex', 'Prefer not to say']
  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']

  const apps = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === 'Yes' &&
    app.personalDetails.sex !== undefined)

  const data = {}
  data.items = []
  data.totals = {}
  data.rates = {}

  data.totals.received = apps.length

  statuses.forEach((status, i) => {
    data.totals[status] = apps.filter(app => app.status === status).length

    data.rates[status] = data.totals.received ? ((data.totals[status] / data.totals.received) * 100) : 0
    data.rates[status] = numeral(data.rates[status]).format('0.[0]')
  })

  options.forEach((option, i) => {
    const item = {}

    item.title = option

    item.counts = {}
    item.rates = {}

    item.counts.received = apps.filter(app => app.personalDetails.sex === option).length

    statuses.forEach((status, i) => {
      item.counts[status] = apps.filter(app => app.personalDetails.sex === option &&
        app.status === status).length

      item.rates[status] = item.counts.received ? ((item.counts[status] / item.counts.received) * 100) : 0

      item.rates[status] = numeral(item.rates[status]).format('0.[0]')
    })

    data.items.push(item)
  })

  return data
}

exports.getDisabilityQuestionResponseCounts = (applications) => {
  const options = ['Yes', 'No', 'Prefer not to say']
  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']

  const apps = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === 'Yes' &&
    app.personalDetails.disabled !== undefined)

  const data = {}
  data.items = []
  data.totals = {}
  data.rates = {}

  data.totals.received = apps.length

  statuses.forEach((status, i) => {
    data.totals[status] = apps.filter(app => app.status === status).length

    data.rates[status] = data.totals.received ? ((data.totals[status] / data.totals.received) * 100) : 0
    data.rates[status] = numeral(data.rates[status]).format('0.[0]')
  })

  options.forEach((option, i) => {
    const item = {}

    item.title = option

    item.counts = {}
    item.rates = {}

    item.counts.received = apps.filter(app => app.personalDetails.disabled === option).length

    statuses.forEach((status, i) => {
      item.counts[status] = apps.filter(app => app.personalDetails.disabled === option &&
        app.status === status).length

      item.rates[status] = item.counts.received ? ((item.counts[status] / item.counts.received) * 100) : 0

      item.rates[status] = numeral(item.rates[status]).format('0.[0]')
    })

    data.items.push(item)
  })

  return data
}

exports.getDisabilityData = (applications) => {
  const options = [
    { title: 'Blind', description: 'Includes serious visual impairments which are not corrected by glasses' },
    { title: 'Deaf', description: 'Includes serious hearing impairments' },
    { title: 'Learning difficulty', description: 'For example, dyslexia, dyspraxia or ADHD' },
    { title: 'Long-standing illness', description: 'For example, cancer, HIV, diabetes, chronic heart disease or epilepsy' },
    { title: 'Mental health condition', description: 'For example, depression, schizophrenia or anxiety disorder' },
    { title: 'Physical disability or mobility issue', description: 'For example, impaired use of arms or legs, use of a wheelchair or crutches' },
    { title: 'Social or communication impairment', description: 'For example, Asperger’s or another autistic spectrum disorder' },
    { title: 'Other', description: '' }
  ]

  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']

  const data = {}
  data.items = []
  data.totals = {}
  data.rates = {}

  const apps = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === 'Yes')

  options.forEach((option, i) => {
    const item = {}

    item.title = option.title
    item.description = option.description

    item.counts = {}
    item.rates = {}

    item.counts.received = apps.filter(app => app.personalDetails.disabilities !== undefined &&
      app.personalDetails.disabilities.includes(option.title)).length

    statuses.forEach((status, i) => {
      item.counts[status] = apps.filter(app => app.personalDetails.disabilities !== undefined &&
        app.personalDetails.disabilities.includes(option.title) &&
        app.status === status).length

      item.rates[status] = item.counts.received ? ((item.counts[status] / item.counts.received) * 100) : 0

      item.rates[status] = numeral(item.rates[status]).format('0.[0]')
    })

    data.items.push(item)
  })

  return data
}

// const AGES = [
//   { key: '18_under', value: 'Under 18', lower: 0, upper: 18 },
//   { key: '18_to_24', value: '18 to 24', lower: 18, upper: 24 },
//   { key: '25_to_34', value: '25 to 34', lower: 25, upper: 34 },
//   { key: '35_to_44', value: '35 to 44', lower: 35, upper: 44 },
//   { key: '45_to_54', value: '45 to 54', lower: 45, upper: 54 },
//   { key: '55_to_64', value: '55 to 64', lower: 55, upper: 64 },
//   { key: '65_over', value: '65 and over', lower: 65, upper: 100 }
// ]

const AGES = [
  { key: '21_under', value: '21 and under', lower: 0, upper: 21 },
  { key: '22_', value: '22', lower: 22, upper: 22 },
  { key: '23_', value: '23', lower: 23, upper: 23 },
  { key: '24_', value: '24', lower: 24, upper: 24 },
  { key: '25_to_29', value: '25 to 29', lower: 25, upper: 29 },
  { key: '30_to_34', value: '30 to 34', lower: 30, upper: 34 },
  { key: '35_to_39', value: '35 to 39', lower: 35, upper: 39 },
  { key: '40_to_44', value: '40 to 44', lower: 40, upper: 44 },
  { key: '45_to_49', value: '45 to 49', lower: 45, upper: 49 },
  { key: '50_to_54', value: '50 to 54', lower: 50, upper: 54 },
  { key: '55_to_59', value: '55 to 59', lower: 55, upper: 59 },
  { key: '60_to_64', value: '60 to 64', lower: 60, upper: 64 },
  { key: '65_over', value: '65 and over', lower: 65, upper: 100 }
]

const getAgeCounts = (applications) => {
  const counts = []

  // default the counts to zero
  AGES.forEach((age, i) => {
    counts[age.key] = 0
  })

  applications.forEach((app, i) => {
    const dateOfBirth = DateTime.fromISO(app.personalDetails.dateOfBirth)
    const currentYear = DateTime.now().year
    const years = Math.round(DateTime.fromJSDate(CURRENT_CYCLE.ageCalculationDate).diff(dateOfBirth, 'years').toObject().years)

    AGES.forEach((age, i) => {
      if (years >= age.lower && years <= age.upper) {
        counts[age.key] += 1
      }
    })
  })

  return counts
}

exports.getAgeData = (applications) => {
  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']
  const counts = {}
  counts.received = getAgeCounts(applications)

  statuses.forEach((status, i) => {
    counts[status] = getAgeCounts(applications.filter(app => app.status === status))
  })

  const data = {}
  data.items = []
  data.totals = {}
  data.rates = {}

  data.totals.received = applications.length

  statuses.forEach((status, i) => {
    data.totals[status] = applications.filter(app => app.status === status).length

    data.rates[status] = data.totals.received ? ((data.totals[status] / data.totals.received) * 100) : 0
    data.rates[status] = numeral(data.rates[status]).format('0.[0]')
  })

  AGES.forEach((age, i) => {
    const item = {}

    item.title = age.value

    item.counts = {}
    item.rates = {}

    item.counts.received = counts.received[age.key]

    statuses.forEach((status, i) => {
      item.counts[status] = counts[status][age.key]
      item.rates[status] = item.counts.received ? ((item.counts[status] / item.counts.received) * 100) : 0
      item.rates[status] = numeral(item.rates[status]).format('0.[0]')
    })

    data.items.push(item)
  })

  return data
}

exports.getDiversityQuestionnaireResponseCounts = (applications) => {
  const options = ['Yes', 'No']
  const statuses = ['Recruited', 'Rejected', 'Application withdrawn', 'Declined']
  const data = []

  options.forEach((option, i) => {
    const item = {}

    item.title = option

    item.counts = {}
    item.rates = {}

    item.counts.received = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === option).length

    statuses.forEach((status, i) => {
      status = status.toLowerCase()

      // if (status === 'application withdrawn') {
      //   status = 'withdrawn'
      // }

      item.counts[status] = applications.filter(app => app.personalDetails.diversityQuestionnaireAnswered === option &&
        app.status === statuses[i]).length

      item.rates[status] = item.counts.received ? ((item.counts[status] / item.counts.received) * 100) : 0

      item.rates[status] = numeral(item.rates[status]).format('0.[0]')
    })

    data.push(item)
  })

  return data
}
