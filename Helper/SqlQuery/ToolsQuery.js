module.exports = {
    GetBookMarksByUserIdQuery: function (userId) {
        let query = " SELECT  [BookmarkID]"
            + " ,[Name]"
            + " ,[UserId]"
            + " ,[Latitude]"
            + " ,[Longitude]"
            + " ,[ZoomLevel]"
            + " ,[Created] from [dbo].[Bookmarks] where [UserId]='" + userId + "' and [IsDeleted]=0";
        return query;
    },
    GetSaveBookMarkQuery: function (param) {
        let query = " INSERT INTO [dbo].[Bookmarks] ([Name], [UserId], [Latitude], [Longitude], [ZoomLevel], [BaseMapProviderBaseMapProviderID],[Created], [IsDeleted]) values("
            + "'" + param.Name + "',"
            + "'" + param.UserID + "',"
            + param.Latitude + ","
            + param.Longitude + ","
            + param.ZoomLevel + ","
            + param.BaseMapProviderID + ",getDate(),0)";
        return query;
    },
    GetEnergyLayersIdsQuery: function (tableNames) {
        let xTableNames = [];
        let query = "select EnergyLayerID, TableName from [MapSearchAttributes].[dbo].[EnergyLayers] where ";
        for (var tableName of tableNames) {
            if (!tableName.startsWith("x"))
                query += "TableName like '%" + tableName + "%' or "
            else
                xTableNames.push(tableName);
        }
        query = query.substring(0, query.length - 4);
        if (xTableNames.length > 0) {
            if (xTableNames.length == 2)
                query += " or LayerName in ('Transmission Lines All','All Substations')"
            else if (xTableNames.length == 1) {
                if (xTableNames[0].startsWith("xpower"))
                    query += " or LayerName in ('Transmission Lines All')"
                else
                    query += " or LayerName in ('All Substations')"
            }
        }
        return query;
    }
}

