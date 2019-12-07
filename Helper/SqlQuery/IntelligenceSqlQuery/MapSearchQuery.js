var config = require('config');
module.exports = {
    TestFunction: function () {
        return "Mapsearch Test"
    },
    GetAllListCompanies: function () {
        // var Query = "select cmp.CO_ID,cmp.UtilityID,cmp.CompanyID,cmp.CompanyTypeID,cmp.CompanyName,cmp.Inactive,cmp.MailingAddress" +
        //     " ,cmp.MailingCity,cmp.MailingCountry,cmp.MailingState,cmp.MailingZip,cmp.PhyAddress,cmp.PhyCity,cmp.PhyCountry,cmp.PhyState,cmp.PhyZip,cmp.FERCID" +
        //     " ,(select count(*) as powerPlantOwned  from  [dbo].[PowerOwners] pw where pw.CompanyID=cmp.CompanyID ) as powerPlantOwned" +
        //     " ,(select count(*)as powerPlantOperated from [dbo].[PowerOperators] po where po.CompanyID = cmp.CompanyID ) as powerPlantOperated" +
        //     " ,(select count(*) as FacilityOwned from [dbo].[FacilityOwners] fo where fo.CompanyID = cmp.CompanyID ) as FacilityOwned" +
        //     " ,(select count(*) as FacilityOperated from FacilityOperators fop  where  fop.CompanyID = cmp.CompanyID) as FacilityOperated" +
        //     " from [dbo].[Company] cmp ";
        Query = "select cmp.CO_ID,cmp.UtilityID,cmp.CompanyID,cmp.CompanyTypeID,cmp.CompanyName,cmp.Inactive,cmp.MailingAddress ,cmp.MailingCity,cmp.MailingCountry,cmp.MailingState,cmp.MailingZip,cmp.PhyAddress,cmp.PhyCity,cmp.PhyCountry,cmp.PhyState,cmp.PhyZip,cmp.FERCID" +
            " ,powerPlantOwned.powerPlantOwned" +
            " ,powerPlantOperated.powerPlantOperated" +
            " ,FacilityOwned.FacilityOwned" +
            " ,FacilityOperated.FacilityOperated" +
            " from [dbo].[Company] cmp" +
            " outer apply (select count(*) as powerPlantOwned  from  [dbo].[PowerOwners] pw where pw.CompanyID=cmp.CompanyID) as powerPlantOwned" +
            " outer apply (select count(*)as powerPlantOperated from [dbo].[PowerOperators] po where po.CompanyID = cmp.CompanyID ) as powerPlantOperated " +
            " outer apply (select count(*) as FacilityOwned from [dbo].[FacilityOwners] fo where fo.CompanyID = cmp.CompanyID ) as FacilityOwned" +
            " outer apply (select count(*) as FacilityOperated from FacilityOperators fop  where  fop.CompanyID = cmp.CompanyID) as FacilityOperated ";
        return Query;
    },
    GetFilteredCompanyList: function (val) {
        Query = "select cmp.CompanyID,cmp.CompanyName from company as cmp where  cmp.CompanyName like '%" + decodeURIComponent(val) + "%' Order by cmp.CompanyName";
        return Query;
    },
    GetAllCompanyUsState: function () {
        let Query = "  select sd.statecode,sd.stateProvince from StateCode as sd where sd.CountryCode='US' and sd.StateCode in (select distinct LTRIM(RTRIM(cmp.PhyState)) as PhyState  from [dbo].[Company] cmp where (LTRIM(RTRIM(cmp.PhyState)) is not null or LTRIM(RTRIM(cmp.PhyState)) != '') group by cmp.PhyState) order by  sd.stateProvince ";
        return Query;
    },
    GetALLCompanyBusinessLine: function () {
        let Query = " select distinct bl.businessLine,bl.businessLineNumber from CompanyEntities as ce,CompanyBusinessLines as cbl,BusinessLine as bl" +
            " where  ce.CompanyID= cbl.CompanyID" +
            " and cbl.BusinessLineNumber=bl.BusinessLineNumber" +
            " order by  bl.BusinessLine; ";
        return Query
    },
    GetallCommodity: function () {
        let Query = " select distinct cdy.commodity, cdy.commodityNumber from Company as cmp,CompanyCommodities as cmpcommo,Commodity as cdy" +
            " where cmp.CompanyID= cmpcommo.CompanyID" +
            " and cmpcommo.CommodityNumber=cdy.CommodityNumber" +
            " order by Commodity;";
        return Query;
    },
    GetAllEntity: function () {
        let Query = " select distinct enty.entity, enty.entityNumber from Company as cmp,CompanyEntities as cmpEnty,Entity as enty" +
            " where cmp.CompanyID=cmpEnty.CompanyID" +
            " and cmpenty.EntityNumber=enty.EntityNumber;";
        return Query;
    },
    GetAllEntityType: function () {
        let Query = " select distinct entty.entityType, entty.entityTypeNumber from Company as cmp,CompanyEntityType as cmpenttype,EntityType as entty" +
            " where cmp.CompanyID=cmpenttype.CompanyID" +
            " and  cmpenttype.EntityTypeNumber = entty.EntityTypeNumber" +
            " order by entty.EntityType;";
        return Query;
    },
    GetAllCompanyOptions: function () {
        let Query = this.GetAllCompanyUsState() + this.GetALLCompanyBusinessLine()
            + this.GetallCommodity() + this.GetAllEntity() + this.GetAllEntityType();
        return Query;
    },
    GetAllCompanyName: function () {
        let Query = "  select distinct cmp.CompanyName from company cmp";
        return Query;
    },
    GetAllCompanyProfile: function (param) {
        let Query = "";
        let Take = param.take;
        let skip = param.skip;
        // let takecount = 0;
        // let skip = 0;
        // if (!Take) Take = 0;
        // if (Take <= 0) {
        //     takecount = 5000;
        //     skip = 0;
        // }
        // else {
        //     takecount = Take;
        //     skip = 5000;
        // }

        // Query = "select top " + Take + " * from (" +
        //     "select ROW_NUMBER() OVER (ORDER BY CompanyID) AS ROW_NUM,cmp.CO_ID,cmp.UtilityID,cmp.CompanyID,cmp.CompanyTypeID,cmp.CompanyName,cmp.Inactive,cmp.MailingAddress ,cmp.MailingCity,cmp.MailingCountry,cmp.MailingState,cmp.MailingZip,cmp.PhyAddress,cmp.PhyCity,cmp.PhyCountry,cmp.PhyState,cmp.PhyZip,cmp.FERCID ,(select count(*) as powerPlantOwned  from  [dbo].[PowerOwners] pw where pw.CompanyID=cmp.CompanyID ) as powerPlantOwned ,(select count(*)as powerPlantOperated from [dbo].[PowerOperators] po where po.CompanyID = cmp.CompanyID ) as powerPlantOperated ,(select count(*) as FacilityOwned from [dbo].[FacilityOwners] fo where fo.CompanyID = cmp.CompanyID ) as FacilityOwned ,(select count(*) as FacilityOperated from FacilityOperators fop  where  fop.CompanyID = cmp.CompanyID) as FacilityOperated from [dbo].[Company] cmp" +
        //     ") x where x.ROW_NUM>" + skip;
        Query = "select top " + Take + " * from (" +
            " select ROW_NUMBER() OVER (ORDER BY CompanyID) AS ROW_NUM,"+
            " cmp.CO_ID,"+
            " cmp.UtilityID,"+
            " cmp.CompanyID,"+
            " cmp.CompanyTypeID,"+
            " cmp.CompanyName,"+
            " cmp.Inactive,"+
            " cmp.MailingAddress,"+
            " cmp.MailingCity,"+
            " cmp.MailingCountry,"+
            " cmp.MailingState,"+
            " cmp.MailingZip,"+
            " cmp.PhyAddress,"+
            " cmp.PhyCity,"+
            " cmp.PhyCountry,"+
            " cmp.PhyState,"+
            " cmp.PhyZip,"+
            " cmp.FERCID,"+
            " powerPlantOwned.powerPlantOwned,"+
            " powerPlantOperated.powerPlantOperated,"+
            " FacilityOwned.FacilityOwned,"+
            " FacilityOperated.FacilityOperated,"+ 
            " CompanyBusinessLines.CompanyBusinessLines,"+
            " CompanyCommodities.CompanyCommodities,"+
            " CompanyOwners.CompanyOwners,"+
            " SystematicOwners.SystematicOwners,"+
            " SystematicOperators.SystematicOperators,"+
            " CompanyContacts.CompanyContacts,"+
            " TransProjectOwner.TransProjectOwner,"+
            " transOperatedlist.transOperatedlist,"+
            " CompanyIndsOwner.CompanyIndsOwner"+
            " from [dbo].[Company] cmp"+
            " outer apply(select count(*) as CompanyOwners from CompanyOwners   where  CompanyID = cmp.CompanyID) as CompanyOwners"+
            " outer apply (select count(*) as FacilityOwned from [dbo].[FacilityOwners] fo where fo.CompanyID = cmp.CompanyID ) as FacilityOwned"+
            " outer apply(select count(*) as FacilityOperated from FacilityOperators fop  where  fop.CompanyID = cmp.CompanyID) as FacilityOperated"+
            " outer apply(select count(*) as SystematicOwners from SystematicOwners   where  CompanyID = cmp.CompanyID) as SystematicOwners"+
            " outer apply(select count(*) as SystematicOperators from SystematicOperators   where  CompanyID = cmp.CompanyID) as SystematicOperators"+
            " outer apply (select count(*) as powerPlantOwned  from  [dbo].[PowerOwners] pw where pw.CompanyID=cmp.CompanyID ) as powerPlantOwned"+
            " outer apply (select count(*)as powerPlantOperated from [dbo].[PowerOperators] po where po.CompanyID = cmp.CompanyID ) as powerPlantOperated"+
            " outer apply(select count(*) as TransProjectOwner from TransProjectOwner   where  CompanyID = cmp.CompanyID) as TransProjectOwner"+
            " outer apply(select count(TransProjectID) as transOperatedlist from TransmissionProjects   where  SponsorID = cmp.CompanyID) as transOperatedlist"+
            " outer apply(select count(*) as CompanyIndsOwner from IndustryHoldingComps   where  CompanyID = cmp.CompanyID) as CompanyIndsOwner"+
            " outer apply(select count(*) as CompanyBusinessLines from CompanyBusinessLines  where  CompanyID = cmp.CompanyID) as CompanyBusinessLines"+
            " outer apply(select count(*) as CompanyCommodities from CompanyCommodities   where  CompanyID = cmp.CompanyID) as CompanyCommodities"+
            " outer apply(select count(*) as CompanyContacts from CompanyContacts   where  CompanyID = cmp.CompanyID) as CompanyContacts"+
            " where (CompanyOwners.CompanyOwners<>0"+
            " or (FacilityOwned.FacilityOwned<>0  and  FacilityOperated.FacilityOperated<>0)"+
            " or (SystematicOwners.SystematicOwners<>0 and SystematicOperators.SystematicOperators<>0)"+
            " or (powerPlantOwned.powerPlantOwned<>0 and powerPlantOperated.powerPlantOperated<>0)"+
            " or (TransProjectOwner.TransProjectOwner<>0 and transOperatedlist.transOperatedlist<>0))"+
            " or CompanyIndsOwner.CompanyIndsOwner<>0"+ 
            " or CompanyContacts.CompanyContacts<>0" +
            " ) x where x.ROW_NUM>" + skip;
        return Query;

    },
    GetCompanyDataSearchDataResult: function (param) {
        let Query = this.GetAllListCompanies();
        let State = param.State;
        let Commodity = param.Commodity;
        let Enitity = param.Enitity;
        let EntityType = param.EntityType;
        let BusinessLine = param.BusinessLine;
        let Filter = "";
        if (State) {
            let SplitStateList = State.split(',');
            let Sqlcondistion = "";
            for (let s = 0; s < SplitStateList.length; s++) {
                if (!Sqlcondistion) {
                    Sqlcondistion = "'" + SplitStateList[s] + "'";
                } else {
                    Sqlcondistion += ",'" + SplitStateList[s] + "'";
                }
            }
            if (Sqlcondistion) {
                if (!Filter)
                    Filter += " Where";
                else Filter += " and ";

                Filter += " LTRIM(RTRIM(cmp.PhyState)) in (" + Sqlcondistion + ") ";
            }
        }
        if (Commodity) {
            if (!Filter)
                Filter += " Where";
            else Filter += " and ";

            Filter += " cmp.CompanyID in  (select distinct CompanyId from  CompanyCommodities where CommodityNumber in (" + Commodity + "))";
        }
        if (Enitity) {
            if (!Filter)
                Filter += " Where";
            else Filter += " and ";

            Filter += " cmp.CompanyID in  (select distinct CompanyId from CompanyEntities where Entitynumber in (" + Enitity + "))";
        }
        if (EntityType) {
            if (!Filter)
                Filter += " Where";
            else Filter += " and ";
            Filter += " cmp.CompanyID in  (select distinct  CompanyId from CompanyEntityType where EntityTypeNumber in (" + EntityType + "))";

        }
        if (BusinessLine) {
            if (!Filter)
                Filter += " Where";
            else Filter += " and ";
            Filter += " cmp.CompanyID in  (select distinct CompanyId from CompanyBusinessLines where BusinessLineNumber in (" + BusinessLine + "))";

        }
        return Query + Filter;
    },
    GetResultURL: function (id, type) {
        let url = config.DotnetAPI.apiMapsearchDataURL;
        switch (type) {
            case "CompanyProfile":
                url += "WSCompanies.svc/GetTempCompanyProfileById/?id=" + id;
                break;
            case "CompanyContacts":
                url += "WSCompanies.svc/GetCompanyContactsByCompID/?id=" + id;
                break;

            case "CompanyOwner":
                url += "WSCompanies.svc/GetCompanyProfileOwnerByCompID/?id=" + id;
                break;

            case "CompanySubsidry":
                url += "WSCompanies.svc/GetCompanyProfileSubsidryByCompID/?id=" + id;
                break;

            case "CompanyIndustry":
                url += "WSCompanies.svc/GetCompanyProIndustryOwnersByCoID/?id=" + id;
                break;

            case "CompanyDocuments":
                url += "WSCompanies.svc/GetCompanyProfileDocumentsCompID/?id=" + id;
                break;

            case "CompanyTransmission":
                url += "WSCompanies.svc/GetCompanyProTransmissionProject/?id=" + id;
                break;
            case "CompanyPowerOwner":
                url += "WSCompanies.svc/GetCompanyProPowerOwnersByCompID/?id=" + id;
                break;

            case "CompanyPowerOperator":
                url += "WSCompanies.svc/GetCompanyProPowerOperatorsByCompID/?id=" + id;
                break;

            case "CompanyFacilityOperator":
                url += "WSCompanies.svc/GetCompanyProFacilityOperator/?id=" + id;
                break;

            case "CompanyFacilityOwner":
                url += "WSCompanies.svc/GetCompanyProFacilityOwners/?id=" + id;
                break;

            case "CompanySystemOperator":
                url += "WSCompanies.svc/GetCompanyProSystemOperator/?id=" + id;
                break;

            case "CompanySystemOwner":
                url += "WSCompanies.svc/GetCompanyProSystemOwner/?id=" + id;
                break;
            case "CompanyProfileById":
                url += "WSCompanies.svc/GetCompanyProfileCompanyById/?id=" + id;
                break;
            case "OwnerCompany":
                url += "WSCompanies.svc/GetCompanyProfileCompanyById/?id=" + id;
                break;
            case "Contact":
                url += "WScontact.svc/GetCompanyProfileContactById/?id=" + id;
                break;
            case "Facility":
                url += "WSFacilities.svc/GetCompanyProfileFacilityById/?id=" + id;
                break;
            case "System":
                url += "WSSystems.svc/GetCompanyProfileSystemById/?id=" + id;
                break;
            case "Power":
                url += "WSPowers.svc/GetCompanyProfilePowerById/?id=" + id;
                break;
            case "Transmission":
                url += "WSTransmissionProject.svc/GetCompanyProfileTransmissionProjectById/?id=" + id;
                break;
            case "Industry":
                url += "WSIndustryProjects.svc/GetCompanyProfileIndustryById/?id=" + id;
                break;
            default:
                url += "";
                break;
        }
        return url;
    }

}