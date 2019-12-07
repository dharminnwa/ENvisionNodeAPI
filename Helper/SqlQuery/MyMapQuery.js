module.exports = {
    GetCustomMapEnergyLayersQuery: function (customMapId) {
        let query = "select cm.[CustomMapId], cm.[EnergyLayerId], el.[EnergyParentID] ," +
            "(select [IsHaschild] from [MapSearchAttributes].[dbo].[EnergyLayers]  where [EnergyLayerID] = el.[EnergyParentID]) as IsHaschild " +
            "from [MapSearchAttributes].[dbo].[CustomMaps_EnergyLayers] as cm, [MapSearchAttributes].[dbo].[EnergyLayers] as el " +
            "where cm.[EnergyLayerId] = el.[EnergyLayerId] and [IsEnabled]=1 and [CustomMapId] = " + customMapId;
        return query;
    },

    GetCustomMapPrivateLayersQuery: function (customMapId) {
        let query = "select cm.[CustomMapId], cm.[DataSetId], ds.[ParentDataSetID], ds.[UploadedBy] " +
            "from [MapSearchAttributes].[dbo].[CustomMaps_DataSets] as cm, [MapSearchAttributes].[dbo].[DataSets] as ds " +
            "where cm.[DataSetId] = ds.[DataSetId] and ds.[IsEnabled]=1 and cm.[CustomMapId] =" + customMapId;
        return query;
    }
}

