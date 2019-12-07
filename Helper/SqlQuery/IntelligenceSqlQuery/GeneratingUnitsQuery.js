module.exports = {
    GetAllGeneartingUnitsQuery: function (take, skip) {
        let Query = "select top " + take + " * from (" +
            "select   ROW_NUMBER() OVER (ORDER BY pwdunt.ID) AS ROW_NUM, pwdunt.ID as UnitID" +
            " ,pwdunt.GeneratorID as Generator" +
            " ,pwdunt.InstalledCapacity as Capacity" +
            " ,pwdunt.SummerCapacity as SummerCapacity" +
            " ,pwdunt.YearInstalled as OnlineYear" +
            " ,pwd.ID as PowerID" +
            " ,pwd.[Name] as PowerPlant" +
            " ,pwd.PhysicalState as [State]" +
            " ,pwd.PowerNERCRegion as NERC" +
            " ,comp.CompanyID as CompanyID" +
            " ,comp.CompanyName as OperatingUtility" +
            " ,pm.PrimeMover as PrimeMover" +
            " ,pwdsts.[Description] as [Status]" +
            " ,f.FuelTypeCode as PrimaryFuel" +
            " from PowerUnits as pwdunt" +
            " left join Powers as pwd on pwdunt.PowerID = pwd.ID" +
            " left join PowerOperators as pwdopt on pwd.ID=pwdopt.PowerID" +
            " left join Company as comp on pwdopt.CompanyID =comp.CompanyID" +
            " left join PrimeMover as pm on pwdunt.PrimeMoverID = pm.PrimeMoverID" +
            " left join PowerStatuses as pwdsts on pwdunt.StatusID = pwdsts.ID" +
            " left join FuelTypeEIA_Mappings as puf on pwdunt.FuelTypeID = puf.FuelTypeID"+
            " left join FuelType f on puf.FuelTypeID =f.FuelTypeID" +
            " where comp.CompanyName is not null and comp.CompanyName !=''"+            
            " ) x where x.ROW_NUM>" + skip +" order by x.OperatingUtility";
            
        return Query
    },
    GetStateQuery: function () {
        let Query = "select distinct std.StateCode,std.StateProvince from [Powers] as pw right join StateCode as std on pw.PhysicalState=std.StateCode where std.CountryCode='US' order by std.StateProvince;";
        return Query;
    },
    GetNERCQuery: function () {
        let Query = "select distinct pw.PowerNERCRegion as NERCRegionCode from powers as pw where pw.PowerNERCRegion is not null and pw.PowerNERCRegion!='' order by pw.PowerNERCRegion;";
        return Query;
    },
    GetFuelTypeCode: function () {
        let Query = "select distinct puf.MapFuelTypeDesc as FuelTypeCode from PowerUnits as pwdunt left join PowerUnitsFuelTypes as puf on pwdunt.FuelTypeID = puf.UnitFuelTypeID order by puf.MapFuelTypeDesc;";
        return Query;
    },
    GetPrimeMover: function () {
        let Query = "select distinct pm.PrimeMover as PrimeMover from PowerUnits as pwdunt left join PrimeMover as pm on pwdunt.PrimeMoverID = pm.PrimeMoverID where pm.PrimeMover is not null order by  pm.PrimeMover";
        return Query;
    },
    GetStatusQuery: function () {
        let Query = "select distinct pwdsts.[Description] as [Status] from PowerUnits as pwdunt left join PowerStatuses as pwdsts on pwdunt.StatusID = pwdsts.ID order by pwdsts.[Description]";
        return Query;
    },
    GetPowerandComapanySuggestationQuery: function () {
        let Query = " select  STUFF((SELECT  '@' + convert(nvarchar(max),rtrim(Ltrim(pwd.[Name])))" +
            " from PowerUnits as pwdunt" +
            " left join Powers as pwd on pwdunt.PowerID = pwd.ID" +
            " where pwd.[Name] is not null and pwd.[Name] !=''" +
            " group by rtrim(Ltrim(pwd.[Name]))" +
            " order by rtrim(Ltrim(pwd.[Name]))" +
            " FOR XML PATH('')), 1, 1, '') +'@'+" +
            " STUFF((SELECT  '@' + convert(nvarchar(max),rtrim(Ltrim(comp.CompanyName)))" +
            " from PowerUnits as pwdunt" +
            " left join Powers as pwd on pwdunt.PowerID = pwd.ID" +
            " left join PowerOperators as pwdopt on pwd.ID=pwdopt.PowerID" +
            " left join Company as comp on pwdopt.CompanyID =comp.CompanyID" +
            " group by rtrim(Ltrim(comp.CompanyName))" +
            " order by rtrim(Ltrim(comp.CompanyName))" +
            " FOR XML PATH('')), 1, 1, '') as SuggestivePowerplant";
        return Query;
    },
     GetGeneratingUnitsFuelTypeCode: function () {
        let Query = "select distinct f.FuelTypeCode as FuelTypeCode from PowerUnits as pwdunt left join FuelTypeEIA_Mappings as puf on pwdunt.FuelTypeID = puf.FuelTypeID left join FuelType f on puf.FuelTypeID =f.FuelTypeID order by f.FuelTypeCode;";
        return Query;
    }


}