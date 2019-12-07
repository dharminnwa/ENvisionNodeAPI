module.exports = {
    GetAllFacilityDataQuery: function () {
        let Query = " select distinct factype" +
            " ,STUFF((SELECT  ', ' + convert(nvarchar(max),rtrim(Ltrim(a.commodity)))" +
            " from [vwXfacilities] a" +
            " where a.FACTYPE=b.FACTYPE" +
            " group by rtrim(Ltrim(a.commodity))" +
            " order by rtrim(Ltrim(a.commodity))" +
            " FOR XML PATH('')), 1, 1, '') as commodity" +
            " ,STUFF((SELECT  ', ' + convert(nvarchar(max),rtrim(Ltrim(a.STATE_NAME)))" +
            " from [vwXfacilities] a" +
            " where a.FACTYPE=b.FACTYPE" +
            " group by rtrim(Ltrim(a.STATE_NAME))" +
            " order by rtrim(Ltrim(a.STATE_NAME))" +
            " FOR XML PATH('')), 1, 1, '') as STATE_NAME" +
            " from [MapSearchAttributes].[dbo].[vwXfacilities] b" +
            " where STATE_NAME is not null and STATE_NAME !=''" +
            " order by factype";
        return Query;
    },
    GetFacilitiesTypeQuery: function () {
        let Query = "Select count(a.ID) as FTypeId,a.FACTYPE as FTypeName from xFacilities as a group by a.FACTYPE order by a.FACTYPE;";
        return Query;
    },
    GetStateQuery: function () {
        let Query = "Select s.ID as StateID,s.StateName as StateName  from StatesForCustomer as s order by s.StateName;";
        return Query;
    },
    GetParcelsStateQuery: function (UserId) {
        let GetParcelstateroleQuery = "select distinct C.CategoryName from CustomerUsers CusUser ,CategoriesByCustomer ctgbycus,Users U,Category C" +
            " where CusUser.CustomerID=ctgbycus.CustomerId" +
            " and U.UserId=cususer.UserGuid" +
            " and ctgbycus.CategoryId=c.CategoryID" +
            " and U.IsApproved=1" +
            " and U.IsLockedOut=0" +
            " and cususer.UserGuid='" + UserId + "'" +
            " and U.UserId='" + UserId + "'" +
            " and C.IsEnabled=1" +
            " and c.ParentCategoryID=97";
        let Query = "select a.ID,rtrim(ltrim(a.StateCode)) as StateCode,a.StateName,null counties from USStatesForParcels as a where a.IsEnabled=1  and a.StateName in (" + GetParcelstateroleQuery + ")order by a.ID";
        return Query;
    },
    GetParcelsCountyQuery: function () {
        let Query = "select * from TempNatParcelIndex as b ";
        return Query;
    },
    GetWellsstateQuery: function () {
        // let Query = "select * from StateCode as std where std.IsEnabled=1 and std.StateCode is not null and std.StateCode != '' and std.WMSLayer is not null and std.WMSLayer != ''";
        let Query = "select * from StateCode as std " +
            "OUTER APPLY " +
            "( " +
            " SELECT top 1 [DBFProperties],[DetailPanelProperties],[DetailPanelPropertiesMain] FROM [EnergyLayers]  enr " +
            " WHERE enr.TableName = std.WMSLayer " +
            ") A " +
            "where std.IsEnabled=1 " +
            "and std.StateCode is not null " +
            "and std.StateCode != '' " +
            "and std.WMSLayer is not null " +
            "and std.WMSLayer != '' " +
            "and std.StateID != 279";
        return Query;
    },
    GetParcelLayertable: function () {
        //let Query = "select tablename from EnergyLayers where LayerType='ParcelData' and IsEnabled=convert(bit,'true')";
        let Query = " select  STUFF((SELECT  '@' + convert(nvarchar(max),rtrim(Ltrim(tablename)))" +
            " from EnergyLayers where LayerType='ParcelData' and IsEnabled=convert(bit,'true')" +
            " FOR XML PATH('')), 1, 1, '') as ParcelDatatablename";
        //let Query="select tablename,DBFProperties,DetailPanelProperties,DetailPanelPropertiesMain from EnergyLayers where LayerType='ParcelData' and IsEnabled=convert(bit,'true') and TableName like '%ParcelPoints%'"
        return Query
    }
}
