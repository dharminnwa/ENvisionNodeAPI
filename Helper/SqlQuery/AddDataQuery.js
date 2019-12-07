module.exports = {
    SaveToDataSets: function (dataSet) {
        let insertQuery = "";
        if (dataSet.DBFProperties && dataSet.DetailPanelProperties && dataSet.TableName)
            insertQuery = "  insert into [MapSearchAttributes].[dbo].[DataSets]([DataSetName],[Description],[UploadedBy],[UploadedDate],[ModifiedDate],[PublishedDate],[Source],[Citation],[Tags],[Attributes],[IsPublic],[PreviewImage],[FilesIncluded],[IconType],[RepresentationType],[StrokeThicknessPercent],[StrokeColor],[FillColor],[SizePercent],[Opacity],[IsEnabled],[SortNumber],[DataSetGUID],[IsSaveSearch],[LayerTypeID],[TableName],[UploadFileType],[FilePathLocation],[DBFProperties],[DetailPanelProperties]) VALUES ('" + dataSet.DataSetName + "'," + dataSet.Description + ",'" + dataSet.UploadedBy + "',getDate(),getDate(),null," + dataSet.Source + "," + dataSet.Citation + ",'" + dataSet.Tags + "'," + dataSet.Attributes + ",'" + dataSet.IsPublic + "','" + dataSet.PreviewImage + "'," + dataSet.FilesIncluded + ",'" + dataSet.IconType + "','" + dataSet.RepresentationType + "'," + dataSet.StrokeThicknessPercent + ",'" + dataSet.StrokeColor + "','" + dataSet.FillColor + "'," + dataSet.SizePercent + "," + dataSet.Opacity + ",'" + dataSet.IsEnabled + "'," + dataSet.SortNumber + ",'" + dataSet.DataSetGUID + "','" + dataSet.IsSaveSearch + "'," + dataSet.LayerTypeID + ",'" + dataSet.TableName + "','" + dataSet.UploadFileType + "','" + dataSet.FilePathLocation + "','" + dataSet.DBFProperties + "','" + dataSet.DetailPanelProperties + "')";
        else
            insertQuery = "  insert into [MapSearchAttributes].[dbo].[DataSets]([DataSetName],[Description],[UploadedBy],[UploadedDate],[ModifiedDate],[PublishedDate],[Source],[Citation],[Tags],[Attributes],[IsPublic],[PreviewImage],[FilesIncluded],[IconType],[RepresentationType],[StrokeThicknessPercent],[StrokeColor],[FillColor],[SizePercent],[Opacity],[IsEnabled],[SortNumber],[DataSetGUID],[IsSaveSearch],[LayerTypeID],[TableName],[UploadFileType],[FilePathLocation],[DBFProperties],[DetailPanelProperties]) VALUES ('" + dataSet.DataSetName + "'," + dataSet.Description + ",'" + dataSet.UploadedBy + "',getDate(),getDate(),null," + dataSet.Source + "," + dataSet.Citation + ",'" + dataSet.Tags + "'," + dataSet.Attributes + ",'" + dataSet.IsPublic + "','" + dataSet.PreviewImage + "'," + dataSet.FilesIncluded + ",'" + dataSet.IconType + "','" + dataSet.RepresentationType + "'," + dataSet.StrokeThicknessPercent + ",'" + dataSet.StrokeColor + "','" + dataSet.FillColor + "'," + dataSet.SizePercent + "," + dataSet.Opacity + ",'" + dataSet.IsEnabled + "'," + dataSet.SortNumber + ",'" + dataSet.DataSetGUID + "','" + dataSet.IsSaveSearch + "'," + dataSet.LayerTypeID + "," + dataSet.TableName + ",'" + dataSet.UploadFileType + "','" + dataSet.FilePathLocation + "'," + dataSet.DBFProperties + "," + dataSet.DetailPanelProperties + ")";
        let selectQuery = " select top 1 * from [MapSearchAttributes].[dbo].[DataSets] order by [DataSetID] desc";

        return insertQuery + selectQuery;
    },
    GetPrivateLayerById: function (privateLayerId) {
        let query = "  select * from [MapSearchAttributes].[dbo].[DataSets] where [DataSetID] = " + privateLayerId;
        return query;
    },
    GetLayerGridFilters: function (privateLayerIds, userId) {
        let layerGridFilterQuery = "select * from [MapSearchAttributes].[dbo].[LayerGridFilters] where FilterSaveString is not null and FilterSaveString!='' and IsEnergyLayer = 0 and UserId = '" + userId + "' and LayerId in (" + privateLayerIds + ") order by Id desc";
        return layerGridFilterQuery;
    },
    GetPrivateLayerParentsById: function (parentDataSetId) {
        let query = "select * from [MapSearchAttributes].[dbo].[DataSets] where [ParentDataSetID] = " + parentDataSetId + " and [IsEnabled] = 1";
        return query;
    },
    GetPrivateGroupLayerParentsById: function (parentDataSetId, childIds) {
        let query = "select * from [MapSearchAttributes].[dbo].[DataSets] where [ParentDataSetID] = " + parentDataSetId + " and DataSetID in (" + childIds + ") and [IsEnabled] = 1";
        return query;
    },
    GetExternalIcon: function (userId, externalIconId) {
        let query = "  select * from [MapSearchAttributes].[dbo].[ExternalIcons] where [UploadedBy] = '" + userId + "' and [IsDeleted] = 0 and [Id] = " + externalIconId;
        return query;
    },
    GetPrivateLayerByGuid: function (privateLayerGuid) {
        let query = "  select * from [MapSearchAttributes].[dbo].[DataSets] where [DataSetGUID] = '" + privateLayerGuid + "'";
        return query;
    }
}