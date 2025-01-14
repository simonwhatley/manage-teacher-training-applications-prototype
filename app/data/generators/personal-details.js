const { fakerEN_GB: faker } = require('@faker-js/faker')
const { DateTime } = require('luxon')
const weighted = require('weighted')

const generatorHelpers = require('../helpers/generators')

module.exports = () => {
  // ---------------------------------------------------------------------------
  // Nationalities
  // ---------------------------------------------------------------------------
  const nationalityOptions = {
    british: ['British'],
    irish: ['Irish'],
    french: ['French'],
    dual: ['French', 'Swiss'],
    multiple: ['British', 'French', 'Swiss']
  }

  const selectedNationality = weighted.select({
    british: 0.65,
    irish: 0.05,
    french: 0.1,
    dual: 0.1,
    multiple: 0.1
  })

  const nationalities = nationalityOptions[selectedNationality]

  // ---------------------------------------------------------------------------
  // International candidate
  // Flag international candidate (does not have British/Irish nationality)
  // ---------------------------------------------------------------------------
  const isInternationalCandidate = !(nationalities.includes('British') ||
    nationalities.includes('Irish'))

  // ---------------------------------------------------------------------------
  // Length of stay
  // Lived in UK longer than 3 years
  // ---------------------------------------------------------------------------
  let lengthOfStay

  if (!isInternationalCandidate) {
    const lengthOfStayOptions = {
      yes: 'Yes',
      no: 'No'
    }

    const selectedLengthOfStay = weighted.select({
      yes: 0.95,
      no: 0.05
    })

    lengthOfStay = lengthOfStayOptions[selectedLengthOfStay]
  }

  // ---------------------------------------------------------------------------
  // Right to work or study
  // ---------------------------------------------------------------------------
  let rightToWorkStudy
  let rightToWorkStudyHow
  let rightToWorkStudyHowDetails

  if (isInternationalCandidate) {
    const rightToWorkStudyOptions = {
      yes: 'Yes',
      no: 'Not yet'
    }

    const selectedRightToWorkStudy = weighted.select({
      yes: 0.6,
      no: 0.4
    })

    rightToWorkStudy = rightToWorkStudyOptions[selectedRightToWorkStudy]

    if (rightToWorkStudy === 'Not yet') {
      const rightToWorkStudyHowOptions = {
        visa: 'A visa sponsored by a course provider',
        other: 'Another route'
      }

      const selectedRightToWorkStudyHow = weighted.select({
        visa: 0.7,
        other: 0.3
      })

      rightToWorkStudyHow = rightToWorkStudyHowOptions[selectedRightToWorkStudyHow]

      if (rightToWorkStudyHow === 'Another route') {
        const rightToWorkStudyHowChoices = [
          'I’m applying for a permanent residence card',
          'I’m applying for a visa',
          'I have refugee status',
          'I’m applying for a student visa',
          'I’m applying for a spousal visa'
        ]

        const rightToWorkStudyHowDetails = faker.helpers.arrayElement(rightToWorkStudyHowChoices)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Immigration status
  // ---------------------------------------------------------------------------
  let immigrationStatus
  let immigrationStatusDetails

  if (isInternationalCandidate) {
    if (rightToWorkStudy === 'Yes') {
      const immigrationStatusOptions = {
        settled: 'EU settled status',
        presettled: 'EU pre-settled status',
        other: 'Other'
      }

      const selectedImmigrationStatus = weighted.select({
        settled: 0.6,
        presettled: 0.35,
        other: 0.05
      })

      immigrationStatus = immigrationStatusOptions[selectedImmigrationStatus]

      if (immigrationStatus === 'Other') {
        immigrationStatusDetails = faker.lorem.sentence()
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Date entered UK
  // ---------------------------------------------------------------------------
  let dateEnteredUK

  if (isInternationalCandidate) {
    if (rightToWorkStudy === 'Yes') {
      dateEnteredUK = faker.date.between({ from: '2000-01-01', to: '2016-08-31' })
      // faker creates a time, which isn't necessary, so we remove it
      dateEnteredUK = DateTime.fromJSDate(dateEnteredUK).toFormat('yyyy-LL-dd')
    }
  }

  // ---------------------------------------------------------------------------
  // Date of birth
  // ---------------------------------------------------------------------------
  const dateOfBirthOptions = {
    y21_under: faker.date.between({ from: '2000-01-01', to: '2001-12-31' }),
    y22_to_24: faker.date.between({ from: '1997-01-01', to: '1999-12-31' }),
    y25_to_29: faker.date.between({ from: '1992-01-01', to: '1996-12-31' }),
    y30_to_34: faker.date.between({ from: '1987-01-01', to: '1991-12-31' }),
    y35_to_39: faker.date.between({ from: '1982-01-01', to: '1986-12-31' }),
    y40_to_44: faker.date.between({ from: '1977-01-01', to: '1981-12-31' }),
    y45_to_49: faker.date.between({ from: '1972-01-01', to: '1976-12-31' }),
    y50_to_54: faker.date.between({ from: '1967-01-01', to: '1971-12-31' }),
    y55_to_59: faker.date.between({ from: '1962-01-01', to: '1966-12-31' }),
    y60_to_64: faker.date.between({ from: '1957-01-01', to: '1961-12-31' }),
    y65_over: faker.date.between({ from: '1950-01-01', to: '1956-12-31' })
  }

  const selectedDateOfBirth = weighted.select({
    y21_under: 0.18,
    y22_to_24: 0.23,
    y25_to_29: 0.20,
    y30_to_34: 0.12,
    y35_to_39: 0.10,
    y40_to_44: 0.08,
    y45_to_49: 0.05,
    y50_to_54: 0.03,
    y55_to_59: 0.01,
    y60_to_64: 0,
    y65_over: 0
  })

  let dateOfBirth = dateOfBirthOptions[selectedDateOfBirth]
  // faker creates a time, which isn't necessary, so we remove it
  dateOfBirth = DateTime.fromJSDate(dateOfBirth).toFormat('yyyy-LL-dd')

  // ---------------------------------------------------------------------------
  // Equality and diversity
  // ---------------------------------------------------------------------------
  let sex
  let disabled
  let disabilities
  let ethnicGroup
  let ethnicBackground

  const diversityQuestionnaireAnswered = faker.helpers.arrayElement(['Yes', 'Yes', 'No'])

  // Candidate's sex
  const sexOptions = {
    female: 'Female',
    male: 'Male',
    intersex: 'Intersex',
    preferNotToSay: 'Prefer not to say'
  }

  const selectedSex = weighted.select({
    female: 0.4,
    male: 0.4,
    intersex: 0.01,
    preferNotToSay: 0.19
  })

  // Candidate disability
  const disabledOptions = {
    yes: 'Yes',
    no: 'No',
    preferNotToSay: 'Prefer not to say'
  }

  const selectedDisabled = weighted.select({
    yes: 0.2,
    no: 0.75,
    preferNotToSay: 0.05
  })

  // Ethnic groups
  const ethnicGroupOptions = {
    asian: 'Asian or Asian British',
    black: 'Black, African, Black British or Caribbean',
    mixed: 'Mixed or multiple ethnic groups',
    white: 'White',
    other: 'Another ethnic group',
    preferNotToSay: 'Prefer not to say'
  }

  const selectedEthnicGroup = weighted.select({
    asian: 0.15,
    black: 0.12,
    mixed: 0.03,
    white: 0.66,
    other: 0.03,
    preferNotToSay: 0.01
  })

  // Ethnic backgrounds (subset of groups)
  const ethnicBackgroundOptions = {
    asian: {
      bangladeshi: 'Bangladeshi',
      chinese: 'Chinese',
      indian: 'Indian',
      pakistani: 'Pakistani',
      other: 'Any other Asian background',
      preferNotToSay: 'Prefer not to say'
    },
    black: {
      african: 'African',
      caribbean: 'Caribbean',
      other: 'Any other Black, African or Caribbean background',
      preferNotToSay: 'Prefer not to say'
    },
    mixed: {
      asian: 'Asian and White',
      african: 'Black African and White',
      caribbean: 'Black Caribbean and White',
      other: 'Any other Mixed or Multiple ethnic background',
      preferNotToSay: 'Prefer not to say'
    },
    white: {
      british: 'British, English, Northern Irish, Scottish, or Welsh',
      irish: 'Irish',
      traveller: 'Irish Traveller or Gypsy',
      other: 'Any other White background',
      preferNotToSay: 'Prefer not to say'
    },
    other: {
      arab: 'Arab',
      other: 'Any other ethnic background',
      preferNotToSay: 'Prefer not to say'
    }
  }

  const selectedEthnicBackground = {
    asian: weighted.select({
      bangladeshi: 0.1,
      chinese: 0.05,
      indian: 0.29,
      pakistani: 0.43,
      other: 0.03,
      preferNotToSay: 0.1
    }),
    black: weighted.select({
      african: 0.8,
      caribbean: 0.16,
      other: 0.03,
      preferNotToSay: 0.01
    }),
    mixed: weighted.select({
      asian: 0.24,
      african: 0.15,
      caribbean: 0.3,
      other: 0.29,
      preferNotToSay: 0.02
    }),
    white: weighted.select({
      british: 0.9,
      irish: 0.01,
      traveller: 0,
      other: 0,
      preferNotToSay: 0.09
    }),
    other: weighted.select({
      arab: 0.45,
      other: 0.51,
      preferNotToSay: 0.04
    })
  }

  if (diversityQuestionnaireAnswered === 'Yes') {
    sex = sexOptions[selectedSex]

    disabled = disabledOptions[selectedDisabled]

    const disabilityCount = faker.number.int(3) // up to 3 disabilities

    const disabilityChoices = [
      'Blind',
      'Deaf',
      'Learning difficulty',
      'Long-standing illness',
      'Mental health condition',
      'Physical disability or mobility issue',
      'Social or communication impairment',
      'Other'
    ]

    const shuffledDisabilities = disabilityChoices.sort(() => 0.5 - Math.random())

    if (disabled === 'Yes' && disabilityCount) {
      disabilities = shuffledDisabilities.slice(0, disabilityCount).sort()
    }

    ethnicGroup = ethnicGroupOptions[selectedEthnicGroup]

    switch (ethnicGroup) {
      case 'Asian or Asian British':
        ethnicBackground = ethnicBackgroundOptions.asian[selectedEthnicBackground.asian]
        break
      case 'Black, African, Black British or Caribbean':
        ethnicBackground = ethnicBackgroundOptions.black[selectedEthnicBackground.black]
        break
      case 'Mixed or multiple ethnic groups':
        ethnicBackground = ethnicBackgroundOptions.mixed[selectedEthnicBackground.mixed]
        break
      case 'White':
        ethnicBackground = ethnicBackgroundOptions.white[selectedEthnicBackground.white]
        break
      case 'Another ethnic group':
        ethnicBackground = ethnicBackgroundOptions.other[selectedEthnicBackground.other]
        break
    }
  }

  return {
    givenName: generatorHelpers.firstName(sex),
    familyName: generatorHelpers.lastName(),
    dateOfBirth,
    nationalities,
    lengthOfStay,
    isInternationalCandidate,
    immigrationStatus,
    immigrationStatusDetails,
    rightToWorkStudy,
    rightToWorkStudyHow,
    rightToWorkStudyHowDetails,
    dateEnteredUK,
    // residency,
    diversityQuestionnaireAnswered,
    sex,
    disabled,
    disabilities,
    ethnicGroup,
    ethnicBackground
  }
}
