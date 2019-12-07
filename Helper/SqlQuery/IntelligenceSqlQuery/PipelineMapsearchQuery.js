var config = require('config');
module.exports = {
    TestFunction: function () {
        return "Mapsearch Test"
    },
    GetProjectStatus: function () {
        let Query = " select distinct stu.[Status] from [Status] as stu,IndustryUpdates as Ind where stu.Status_ID=Ind.StatusID order by  stu.[Status];";
        return Query;
    },
    GetPipelineState: function () {
        let Query = " select LTRIM(RTRIM(sd.statecode)) as statecode,LTRIM(RTRIM(sd.stateProvince)) as stateProvince from StateCode as sd" +
            " where sd.CountryCode='US'" +
            " and sd.StateCode in (" +
            " select distinct   LTRIM(RTRIM(IndLoc.StateCode))  from IndustryUpdates as Ind,IndustryLocations as IndLoc where " +
            " Ind.IndustryUpdateID=IndLoc.IndustryUpdateID" +
            " and IndLoc.CountryCode='US');";
        return Query;
    },
    GetPipelinecomodityQuery: function () {
        let Query = " select distinct como.Commodity,como.CommodityId FROM IndustryUpdates as Ind,IndustryCommodities as  Indcomo,Commodity as como" +
            " WHERE Ind.IndustryUpdateID =Indcomo.IndustryUpdateID" +
            " and Indcomo.CommodityID=como.CommodityId" +
            " ORDER BY como.Commodity;";
        return Query;
    },
    GetPipelineSuggestionQuery: function () {
        let Query = " select STUFF((SELECT  '|' + convert(nvarchar(max),cmp.CompanyName)" +
            " FROM IndustryUpdates as Ind,IndustryHoldingComps as IndHold,Company as cmp" +
            " WHERE Ind.IndustryUpdateID =IndHold.IndustryUpdateID" +
            " and IndHold.CompanyID=cmp.CompanyID" +
            " group by cmp.CompanyName" +
            " ORDER BY cmp.CompanyName" +
            " FOR XML PATH('')), 1, 1, '') AS HoldingCompany," +
            " STUFF((SELECT  '|' + convert(nvarchar(max),Ind.ProjectName)" +
            " FROM IndustryUpdates as Ind" +
            " group by Ind.ProjectName" +
            " ORDER BY Ind.ProjectName" +
            " FOR XML PATH('')), 1, 1, '') AS ProjectName";
        return Query;
    },
    GetAllPipelinefilterOption: function () {
        let AllQuery = this.GetPipelineState() + this.GetPipelinecomodityQuery() + this.GetProjectStatus();
        return AllQuery;
    },
    GetAllPipelineActiviyList: function () {
        let Query = "SELECT Ind.IndustryUpdateID,Ind.ProjectName" +
            " ,STUFF((SELECT  ', ' + convert(nvarchar(max),cmp.CompanyID)" +
            " FROM IndustryHoldingComps IndHold,Company cmp" +
            " WHERE Ind.IndustryUpdateID =IndHold.IndustryUpdateID" +
            " and IndHold.CompanyID=cmp.CompanyID" +
            " group by cmp.CompanyID" +
            " ORDER BY cmp.CompanyID" +
            " FOR XML PATH('')), 1, 1, '') AS CompanyID" +
            " ,STUFF((SELECT  '| ' + convert(nvarchar(max),cmp.CompanyName)" +
            " FROM IndustryHoldingComps IndHold,Company cmp" +
            " WHERE Ind.IndustryUpdateID =IndHold.IndustryUpdateID" +
            " and IndHold.CompanyID=cmp.CompanyID" +
            " group by cmp.CompanyName" +
            " ORDER BY cmp.CompanyName" +
            " FOR XML PATH('')), 1, 1, '') AS HoldingCompany," +
            " STUFF((SELECT  ', ' + convert(nvarchar(max),como.Commodity)" +
            " FROM IndustryCommodities Indcomo,Commodity como" +
            " WHERE Ind.IndustryUpdateID =Indcomo.IndustryUpdateID" +
            " and  Indcomo.CommodityID = como.CommodityId"+
            " group by como.Commodity" +
            " ORDER BY como.Commodity" +
            " FOR XML PATH('')), 1, 1, '') AS Commodities," +
            " STUFF((SELECT  ', ' + convert(nvarchar(max),sd.stateProvince)" +
            " FROM StateCode as sd" +
            " where sd.CountryCode='US' and sd.StateCode in (select distinct   LTRIM(RTRIM(IndLoc.StateCode))  from IndustryLocations as IndLoc where " +
            " Ind.IndustryUpdateID=IndLoc.IndustryUpdateID" +
            " and IndLoc.CountryCode='US')" +
            " FOR XML PATH('')), 1, 1, '') AS StateName" +
            " ,(select top 1 Status from [Status] as stu where stu.Status_ID=Ind.StatusID) as [Status]" +
            " FROM IndustryUpdates Ind" +
            " order by Ind.IndustryUpdateID";
        return Query;
    },
    GetCompnayDetialsBasedonPipelineId(Id) {
        let Query = ' ';
        if (Id > 0) {
            Query = " select cmp.CompanyName as MRHoldingCo" +
                " ,cmp.PhyCity as Hcity" +
                " ,sd.StateProvince  as Hstate" +
                " ,cmp.PhyState" +
                " ,cmp.PhyCountry as Hcountry" +
                " ,cmp.Web as WebSite" +
                " ,cmp.Phone as Hphone" +
                " ,cmp.CompanyID as CompanyID" +
                " from IndustryHoldingComps as Indhold" +
                " left Join company as cmp on cmp.CompanyID=Indhold.CompanyID" +
                " left JOIN StateCode AS sd ON RTRIM(LTRIM(sd.StateCode))=RTRIM(LTRIM(cmp.PhyState)) and sd.CountryCode='US'" +
                " where Indhold.IndustryUpdateID=" + Id + " ;";
        }
        return Query
    },
    GetPipelineDetailsbasedonId(Id) {
        let Query = ' ';
        if (Id > 0) {
            Query = "select Ind.IndustryUpdateID," +
                " Ind.IndustryUpdateID as IndustryID," +
                " Ind.ProjectName as  MRProjectName," +
                " DATEPART(mm,Ind.UpdatedDate) as MRMonth," +
                " DATEPART(yy,Ind.UpdatedDate) as MRYear," +
                " convert(date,Ind.ProjectFinishDate) as ProjectFinishDate," +
                " Ind.TotalEstimatedCost as ProjectCost," +
                " convert(date,Ind.ProjectStartDate) as ProjectStartDate," +
                " Ind.ProjectName as ProjectName," +
                " convert(date,Ind.UpdatedDate) as UpdatedDate," +
                " Ind.ProjectDescription as [Description]," +
                " Ind.StatusID as StatusID," +
                " stu.Status," +
                " Ind.TotalEstimatedCost as TotalEstimatedCost," +
                " Ind.Currency as Currency," +
                " Ind.Docket as FERCDocket," +
                " Ind.MapLink as  MapLink," +
                " Ind.MapLink as MapID," +
                " con.ConPhone," +
                " con.FirstName+' '+con.LastName as Contact" +
                " ,STUFF((SELECT  ',' + convert(nvarchar(max),sd.stateProvince)" +
                " FROM StateCode as sd" +
                " where sd.CountryCode='US' and sd.StateCode in (select distinct   LTRIM(RTRIM(IndLoc.StateCode))  from IndustryLocations as IndLoc where" +
                " Ind.IndustryUpdateID=IndLoc.IndustryUpdateID" +
                " and IndLoc.CountryCode='US'" +
                " group by IndLoc.StateCode)" +
                " FOR XML PATH('')), 1, 1, '') AS StateName" +
                " ,STUFF((SELECT  ', ' + convert(nvarchar(max),como.Commodity)" +
                " FROM IndustryCommodities Indcomo,Commodity como" +
                " WHERE Ind.IndustryUpdateID =Indcomo.IndustryUpdateID" +
                " and Indcomo.CommodityID=como.CommodityId" +
                " group by como.Commodity" +
                " ORDER BY como.Commodity" +
                " FOR XML PATH('')), 1, 1, '') AS Commodities" +
                " ,STUFF((SELECT  ', ' + convert(nvarchar(max),typInd.[Name])" +
                " from IndustryTypes IndTyp,TypeForIndustries typInd" +
                " where IndTyp.TypeID=typInd.ID" +
                " and  IndTyp.IndustryUpdateID=15066" +
                " group by typInd.[Name]" +
                " FOR XML PATH('')), 1, 1, '') AS ProjectType" +
                " ,'' as MRHoldingCo,'' as Hcity,'' as Hstate,'' as Hcountry,'' as WebSite,'' as Hphone,'' as CompanyID"+
                " from IndustryUpdates as Ind" +
                " left join [Status] as stu on stu.Status_ID=Ind.StatusID" +
                " outer apply (select  Con.Phone as ConPhone,Con.FirstName,Con.LastName  from IndustryContacts as IndCon,Contact as Con where IndCon.IndustryUpdateID=Ind.IndustryUpdateID and Con.ContactID=IndCon.ContactID) as con" +
                " where Ind.IndustryUpdateID=" + Id + " ;";
        }
        return Query;
    }

}