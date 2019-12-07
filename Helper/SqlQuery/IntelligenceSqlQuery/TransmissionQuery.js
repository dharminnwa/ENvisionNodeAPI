var config = require('config');
module.exports = {
    GetAllTransmissionDataQuery: function () {
        let Query = "select  transprj.TransProjectID as TransProjectID" +
            " ,transprj.TransProjectName as TransProjectName" +
            " ,transprj.LineMiles as LineMiles" +
            " ,transprj.ConstructionDate as BuildStart" +
            " ,transprj.CompletionDate as YearInService" +
            " ,transprj.EstCost as EstimatedCosts" +
            " ,transprj.Partners as ProjectPartners" +
            " ,transprj.CompletionDate as CompletionYear" +
            " ,transprj.Interstate as Interstate" +
            " ,transprj.NERCRegionID as NERC" +
            " ,transprj.ISOID as ISO" +
            " ,transprj.[EndPoint] as DestinationPoint" +
            " ,transprj.DisplayImage as DisplayImage" +
            " ,transgrp.TransGroupName as ProjectGroup" +
            " ,cmp.CompanyName as ProjectSponsor" +
            " ,cmp.CompanyID as CompanyID" +
            " ,vlt.Voltage as Voltage" +
            " ,FromStateCode.StateProvince as [From]" +
            " ,ToStateCode.StateProvince as [To]" +
            " ,stus.[Status] as ProjectStatus" +
            " ,voltyp.VoltageType as VoltageType" +
            " ,YEAR(transprj.ConstructionDate) as BuildYear" +
            " ,YEAR(transprj.CompletionDate)as ServiceYear" +
            " ,YEAR(transprj.CompletionDate)as YearCompletion" +
            " ,case when(transprj.Interstate=1) then 'Yes' else 'No' end as InterstateVal" +
            " from TransmissionProjects as transprj" +
            " left join TransmissionGroups as transgrp on  transgrp.TransGroupID = transprj.TransGroupID" +
            " left join Company as cmp on cmp.CompanyID = transprj.SponsorID" +
            " left join Voltage as vlt on vlt.VoltageID = transprj.Voltage " +
            " left join [Status] as stus on stus.Status_ID = transprj.StatusID" +
            " left join VoltageType as voltyp on voltyp.VoltageTypeID = transprj.VoltageTypeID" +
            " outer apply(select * from StateCode as std where std.StateID = transprj.FromState) as FromStateCode" +
            " outer apply(select * from StateCode as std where std.StateID = transprj.ToState) as ToStateCode" +
            " where transprj.TransProjectName is not null"+
            " order by transprj.TransProjectID";
        return Query;
    },
    GetSuggestiveTransmissionProjectQuery: function () {
        let query = " select  STUFF((SELECT  '@' + convert(nvarchar(max), transprj.TransProjectName) FROM TransmissionProjects as transprj  where transprj.TransProjectName is not null group by transprj.TransProjectName ORDER BY transprj.TransProjectName FOR XML PATH('')), 1, 1, '') +'@'+" +
            " STUFF((SELECT  '@' + convert(nvarchar(max), cmp.CompanyName) from TransmissionProjects as transprj left join Company as cmp on cmp.CompanyID = transprj.SponsorID  where transprj.TransProjectName is not null  group by cmp.CompanyName ORDER BY cmp.CompanyName FOR XML PATH('')), 1, 1, '') as SuggestiveData";
        return query;
    },
    GetProjectstatusQuery: function () {
        let Query = 'select  distinct stus.[Status] as ProjectStatus	from TransmissionProjects as transprj left join [Status] as stus on stus.Status_ID = transprj.StatusID '
        return Query;
    },
    GetNERCQuery: function () {
        let Query = "select distinct transprj.NERCRegionID as NERC from TransmissionProjects as transprj where transprj.NERCRegionID is not null and transprj.NERCRegionID !=' '  order by transprj.NERCRegionID";
        return Query;
    },
    GetServiceYearQuery: function () {
        let Query = "select distinct YEAR(transprj.CompletionDate) as ServiceYear from TransmissionProjects as transprj order by YEAR(transprj.CompletionDate)";
        return Query;
    },
    GetVoltageTypeQuery: function () {
        let Query = "select  distinct voltyp.VoltageType as VoltageType from TransmissionProjects as transprj  left join VoltageType as voltyp on voltyp.VoltageTypeID = transprj.VoltageTypeID  where voltyp.VoltageType is not null";
        return Query;
    },
    GetISORTOQuery: function () {
        let Query = "select  distinct transprj.ISOID as ISO	  from TransmissionProjects as transprj where transprj.ISOID is not null and transprj.ISOID !=' '  order by transprj.ISOID";
        return Query;
    },
    GetTransmissionDocumentQuery: function (id) {
        let Query = " select Doc.* from TransmissionProjects as transprj" +
            " left join DocumentReferenceDetail as DocRefDtl on DocRefDtl.TableEventID = transprj.TransProjectID and docrefdtl.TableType='Transmission'" +
            " left join Document as Doc on Doc.DocumentID = DocRefDtl.DocumentID" +
            " where transprj.TransProjectID=" + id
        return Query;

    },
    GetGeometryQuery: function (id) {
        let Query = "SELECT transprjmap.TransProjectID as TransProjectId" +
            " ,transprjmap.Shape.ToString() as Geometry1" +
            " ,transprjmap.GeometryType as [type]" +
            " ,transprjmap.LineThickness as strokeWeight" +
            " ,transprjmap.LineColor as strokeColor" +
            " ,transprjmap.LineColor as fillColor" +
            " ,transprjmap.[Geometry] AS [geometry]" +
            " ,transprjmap.Lat" +
            " ,transprjmap.Lng" +
            " ,transprjmap.ZoomLevel" +
            " FROM TransmissionProjectsMap as transprjmap " +
            " WHERE TransProjectID =" + id
        return Query;

    }, 
    GetgetBase64ImageURL: function (id) {
        let url = config.DotnetAPI.apiMapsearchDataURL + "WSCompanies.svc/getBase64Image/?PrjID=" + id;
        return url;
    },
    GetProjectByID: function (id) {
        let Query = "select  transprj.TransProjectID as TransProjectID" +
            " ,transprj.TransProjectName as TransProjectName" +
            " ,transprj.LineMiles as LineMiles" +
            " ,transprj.ConstructionDate as BuildStart" +
            " ,transprj.CompletionDate as YearInService" +
            " ,transprj.EstCost as EstimatedCosts" +
            " ,transprj.Partners as ProjectPartners" +
            " ,transprj.CompletionDate as CompletionYear" +
            " ,transprj.Interstate as Interstate" +
            " ,transprj.NERCRegionID as NERC" +
            " ,transprj.ISOID as ISO" +
            " ,transprj.[EndPoint] as DestinationPoint" +
            " ,transprj.DisplayImage as DisplayImage" +
            " ,transgrp.TransGroupName as ProjectGroup" +
            " ,cmp.CompanyName as ProjectSponsor" +
            " ,cmp.CompanyID as CompanyID" +
            " ,vlt.Voltage as Voltage" +
            " ,FromStateCode.StateProvince as [From]" +
            " ,ToStateCode.StateProvince as [To]" +
            " ,stus.[Status] as ProjectStatus" +
            " ,voltyp.VoltageType as VoltageType" +
            " ,YEAR(transprj.ConstructionDate) as BuildYear" +
            " ,YEAR(transprj.CompletionDate)as ServiceYear" +
            " ,YEAR(transprj.CompletionDate)as YearCompletion" +
            " ,case when(transprj.Interstate=1) then 'Yes' else 'No' end as InterstateVal" +
            " ,transprj.CountryCode as Country" +
            " ,Contact = rtrim(Ltrim(con.FirstName)) + ' ' + rtrim(Ltrim(con.LastName))" +
            " ,Title = con.Title" +
            " ,Phone = con.Phone" +
            " from TransmissionProjects as transprj" +
            " left join TransmissionGroups as transgrp on  transgrp.TransGroupID = transprj.TransGroupID" +
            " left join Company as cmp on cmp.CompanyID = transprj.SponsorID" +
            " left join Voltage as vlt on vlt.VoltageID = transprj.Voltage " +
            " left join [Status] as stus on stus.Status_ID = transprj.StatusID" +
            " left join VoltageType as voltyp on voltyp.VoltageTypeID = transprj.VoltageTypeID" +
            " left join TransProjectContact as transcon on transcon.TransProjectID = transprj.TransProjectID" +
            " left join Contact as con  on con.ContactID = transcon.ContactID" +
            " outer apply(select * from StateCode as std where std.StateID = transprj.FromState) as FromStateCode" +
            " outer apply(select * from StateCode as std where std.StateID = transprj.ToState) as ToStateCode" +
            " where transprj.TransProjectName is not null" +
            " and transprj.TransProjectID=" + id +
            " order by transprj.TransProjectID";
        return Query
    }
}