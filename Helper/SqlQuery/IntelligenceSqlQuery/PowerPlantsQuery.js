module.exports = {
    GetAllPowerPlantData: function () {
        let Query = "select pw.ID as PowerID" +
            " ,pw.[Name] as PowerPlant" +
            " ,pw.Regulated as Regulated" +
            " ,pw.PhysicalState as [State]" +
            " ,pw.PowerNERCRegion as NERC" +
            " ,rtrim(ltrim(pw.PowerISO_RTO)) as ISO_RTO" +
            " ,pw.SectorName as Sector" +
            " ,pw.MaxFuelTypeID as PrimaryFuel" +
            " ,pw.PowerPlateCapacity as CapacityMW" +
            " ,cmp.CompanyID as CompanyID" +
            " ,cmp.CompanyName as TransmissionGridOwner" +
            " ,cmp.CompanyName as OperatingUtility" +
            " ,PowerUnits.Generation as GenerationMWH2015" +
            " from [Powers] as pw" +
            " left join PowerOperators as pwot on pw.ID=pwot.PowerID" +
            " left join Company as cmp on pwot.CompanyID=cmp.CompanyID" +
            " outer apply (select  top 1 * from  PowerUnits as pwun where pwun.PowerID = pw.ID )as PowerUnits";
        return Query;
    },
    GetPowerPlantState: function () {
        let Query = "select distinct  std.StateCode,std.StateProvince from [Powers] as pw right join StateCode as std on pw.PhysicalState=std.StateCode where std.CountryCode='US' order by std.StateProvince;";
        return Query;
    },
    GetPowerPlantNERC: function () {
        let Query = "select distinct pw.PowerNERCRegion as NERCRegionCode from powers as pw where pw.PowerNERCRegion is not null and pw.PowerNERCRegion!='' order by pw.PowerNERCRegion;";
        return Query;
    },
    GetPowerPlantSector: function () {
        let Query = "select distinct pw.SectorName as Sector  from powers as pw where pw.SectorName is not null and pw.SectorName !='' order by pw.SectorName;";
        return Query;
    },
    GetPowerPlantPrimaryFuel: function () {
        let Query = "select distinct pw.MaxFuelTypeID as PrimaryFuel from powers as pw where pw.MaxFuelTypeID is not null and pw.MaxFuelTypeID !='' order by pw.MaxFuelTypeID";
        return Query;
    },
    GetPowerPlantISO_RTO: function () {
        let Query = "select distinct rtrim(ltrim(pw.PowerISO_RTO)) as ISO_RTO from powers as pw where pw.PowerISO_RTO is not null and pw.PowerISO_RTO !='' order by rtrim(ltrim(pw.PowerISO_RTO))";
        return Query;
    },
    GetSuggestivePowerplant: function () {
        let Query = "select    STUFF((SELECT  '@' + convert(nvarchar(max),rtrim(Ltrim(pw.[Name])))" +
            " from [Powers] as pw" +
            " where pw.[Name] is not null and pw.[Name] !=''" +
            " group by rtrim(Ltrim(pw.[Name]))" +
            " order by rtrim(Ltrim(pw.[Name]))" +
            " FOR XML PATH('')), 1, 1, '') + '@'+" +
            " STUFF((SELECT  '@' + convert(nvarchar(max),rtrim(Ltrim(cmp.CompanyName)))" +
            " from [Powers] as pw left join PowerOperators as pwot on pw.ID=pwot.PowerID " +
            " left join Company as cmp on pwot.CompanyID=cmp.CompanyID " +
            " where cmp.CompanyName is not null and cmp.CompanyName !=''" +
            " group by rtrim(Ltrim(cmp.CompanyName))" +
            " order by rtrim(Ltrim(cmp.CompanyName))" +
            " FOR XML PATH('')), 1, 1, '') as SuggestivePowerplant ";
        return Query;
    },
    GetPowerPlantdDetialsQuery(PowerID, CompID) {
        let Query = " select     pwd.ID as PowerID" +
            " ,pwd.[Name] as [Name]" +
            " ,pwd.PhysicalCountry as Country" +
            " ,pwd.PhysicalCity as City" +
            " ,pwd.FCounty as County" +
            " ,pwd.PowerNERCRegion as NERC" +
            " ,pwd.PowerISO_RTO as ISO" +
            " ,pwd.PowerPlateCapacity as Capacity" +
            " ,pwd.CapacityFactor as CapacityFactor" +
            " ,pwd.HeatRate as HeatRate" +
            " ,pwd.MaxFuelTypeID as PrimaryFuel" +
            " ,pwd.PowerRiver as WaterSource" +
            " ,pwd.Regulated as RegulatoryStatus" +
            " ,pwd.SectorName as Sector" +
            " ,pwd.PhysicalState as [State]" +
            " ,pwd.Lat as latitude" +
            " ,pwd.Long as longitude" +
            " ,pwd.PowerEIAPlantCode as PowerEIAPlantCode" +
            " ,powerUnits.Generation as GenerationMWh2015" +
            " ,cmp.CompanyName as TransFacilityOwner" +
            " ,enttyp.EntityType as OwnershipType" +
            " ,Compnay.CompanyName as OperatingUtility" +
            " from Powers as pwd" +
            " left join company cmp on cmp.CompanyID=pwd.TransmissionOwner" +
            " left join EntityType as enttyp on enttyp.EntityTypeNumber=cmp.CompanyTypeID" +
            " outer apply (select top 1 pwduni.Generation from PowerUnits pwduni where pwduni.PowerID=pwd.id) as powerUnits" +
            " outer apply (select top 1 comp.CompanyName from company comp where comp.CompanyID=" + CompID + ") as Compnay" +
            " where pwd.id=" + PowerID;
        return Query
    },
    GetPowerUnitsDetailsQuery(PowerID) {
        let Query = " select   pwdunt.ID as UnitID" +
            " ,pwdunt.GeneratorID as Generator" +
            " ,pwdunt.InstalledCapacity as NamePlateCapacity" +
            " ,pwdunt.SummerCapacity as SummerCapabilities" +
            " ,pwdunt.YearInstalled as OnlineYear" +
            " ,pwdunt.OwnershipCode as [Ownership]" +
            " ,pwdunt.ProposedCapacity as ProposedCapacity" +
            " ,pwdsts.[Description] as [Status]" +
            " ,prm.PrimeMover as PrimeMover" +
            " ,fultyp.FuelTypeCode as PrimaryFuel" +
            " from PowerUnits as pwdunt" +
            " left join PowerStatuses as pwdsts on pwdsts.ID = pwdunt.StatusID " +
            " left join PrimeMover as prm on prm.PrimeMoverID = pwdunt.PrimeMoverID " +
            " left join FuelType as fultyp on fultyp.FuelTypeID = pwdunt.FuelTypeID" +
            " where pwdunt.PowerID=" + PowerID;

        return Query;
    },
    GetPlantOperatorQuery(CompID) {
        let Query = "select  cmp.CompanyID as CompanyID" +
            " ,cmp.CompanyName as CompanyName" +
            " ,cmp.PhyAddress as PhysicalAddress1" +
            " ,cmp.PhysicalAddress2 as PhysicalAddress2" +
            " ,cmp.PhyCity as City" +
            " ,cmp.PhyState as [State]" +
            " ,cmp.PhyCountry as Country" +
            " ,cmp.PhyZip as Zip" +
            " ,entyp.EntityType as CompanyType" +
            " ,cmp.CompanyName as ParentCompany" +
            " from company as cmp" +
            " left join  EntityType entyp on entyp.EntityTypeNumber = cmp.CompanyTypeID" +
            " where cmp.CompanyID=" + CompID;
        return Query;
    },
    GetPlantOperatorPowersQuery(CompanyID) {
        let Query = "select    pwd.ID as PowerID" +
            " ,pwd.PhysicalCity as City" +
            " ,pwd.[Name] as PlantName" +
            " ,pwd.FCounty as County" +
            " ,pwd.PhysicalState as [State]" +
            " ,pwd.PowerNERCRegion as NERC" +
            " ,pwd.PowerPlateCapacity as CapacityMWs" +
            " ,pwd.MaxFuelTypeID as PrimaryFuel" +
            " ,pwd.SectorName as Sector" +
            " ,PowerUnits.ProposedCapacity as PlannedIncreasesMWs" +
            " ,PowerUnits.Generation as GenerationMWH2015" +
            " from powers as pwd" +
            " left join PowerOperators as pwdopt on pwdopt.PowerID = pwd.ID" +
            " outer apply(select top 1 * from PowerUnits as pwdunt where pwdunt.PowerID = pwd.ID) as PowerUnits" +
            " where pwdopt.CompanyID=" + CompanyID;
        return Query;
    }

}