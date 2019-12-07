'use strict'

const router = require('express').Router()
const {
    CompanyDataSearchDataResult,
    GetAllCompanyOptions,
    GetAllCompnayList,
    GetResult,
    GetSuggestiveCompanyNameResults,
    TestCompanyIntelligence,
   // GetJsonfiledata,
    GetFilteredCompanyList
} = require('../../Controller/IntelligenceController/CompanayIntelligenceController')
const config = require('config');

var apiCompanyProfileUrl = config.server.IntelligenceSection.apiCompanyProfile;

router.route(apiCompanyProfileUrl + '/')
    .get(TestCompanyIntelligence)

router.route(apiCompanyProfileUrl + '/GetAllCompanyOptions')
    .get(GetAllCompanyOptions)

router.route(apiCompanyProfileUrl + '/GetSuggestiveCompanyNameResults')
    .get(GetSuggestiveCompanyNameResults)

router.route(apiCompanyProfileUrl + '/GetAllCompnayList')
    .get(GetAllCompnayList)

router.route(apiCompanyProfileUrl + '/GetFilterCompnayList')
    .get(GetFilteredCompanyList)

router.route(apiCompanyProfileUrl + '/CompanyDataSearchDataResult')
    .post(CompanyDataSearchDataResult)

router.route(apiCompanyProfileUrl + '/GetResult')
    .get(GetResult);
// router.route(apiCompanyProfileUrl + '/GetJsonfiledata')
//     .get(GetJsonfiledata)
module.exports = router
