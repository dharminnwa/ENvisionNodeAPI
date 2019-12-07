module.exports = {
    GetSavestyleQuery: function (param) {
        var EnergyLayerstyleByuser = param.JsonListofstyle;
        var GetSqlquery = " select * from [dbo].[EnergyLayerStylesByUser]  where [EnergyLayerId] = " + EnergyLayerstyleByuser.EnergyLayerId + " and [UserId] = '" + EnergyLayerstyleByuser.UserId + "' and (mapid is null or mapid='')";
        if (EnergyLayerstyleByuser.mapId) {
            GetSqlquery = " select * from [dbo].[EnergyLayerStylesByUser]  where [EnergyLayerId] = " + EnergyLayerstyleByuser.EnergyLayerId + " and [UserId] = '" + EnergyLayerstyleByuser.UserId + "' and mapid = " + EnergyLayerstyleByuser.mapId;
        }
        let Insertquery = this.GetInsertQuery(param);
        let Updatequery = this.GetUpdateQuery(param);
        if (Insertquery && Updatequery) {
            let query = "IF (NOT EXISTS(" + GetSqlquery + ")) " +
                "BEGIN " + Insertquery + " END ELSE BEGIN " + Updatequery +
                " END " + GetSqlquery;
            GetSqlquery = query;
        }
        return GetSqlquery;
    },
    SaveExternalIconQuery: function (externalIcon) {
        let query = "INSERT INTO [dbo].[ExternalIcons]([Icon],[FileName],[Extension],[UploadedBy],[Uploaded],[IsDeleted],[RightLevel]) VALUES ( convert(varbinary(MAX),'" + externalIcon.resizedImageData + "'),'" + externalIcon.FileName.toLowerCase().replace(".png", "").replace(".icon", "").replace(".gif", "").replace(".jpg", "") + "','" + externalIcon.Extension.toLowerCase().replace("image/", ".") + "','" + externalIcon.UserId + "',getdate(),0,'" + externalIcon.RightLevel + "')";

        let selectExQuery = " Select Top 1 [Id],cast([Icon] as varchar(max)) as Icon ,[FileName] ,[Extension],[UploadedBy],[Uploaded],[IsDeleted],[RightLevel] from [dbo].[ExternalIcons] WHERE [UploadedBy] ='" + externalIcon.UserId + "' ORDER BY id desc";
        return query + selectExQuery;
    },
    GetParentCategory: function () {
        return "select * from Category where parentcategoryid is null and IsEnabled=1  order by Ordernumber ";
    },
    GetchildCategory: function () {
        return "select * from Category where ParentCategoryID is not null  and IsEnabled=1 order by Ordernumber ";
    },
    GetLayercategoriesRolewise: function (UserId) {
        let Query = "select distinct C.* from CustomerUsers CusUser ,CategoriesByCustomer ctgbycus,Users U,Category C" +
            " where CusUser.CustomerID=ctgbycus.CustomerId" +
            " and U.UserId=cususer.UserGuid" +
            " and ctgbycus.CategoryId=c.CategoryID" +
            " and U.IsApproved=1" +
            " and U.IsLockedOut=0" +
            " and cususer.UserGuid='" + UserId + "'" +
            " and U.UserId='" + UserId + "'" +
            " and C.IsEnabled=1" +
            " order by C.OrderNumber";
        return Query;

    },
    GetMapSearchEnergyLayerLibrary: function (param) {
        let _EnergyLayerQery = "";
        if (param.CategoryIdForFilter > 0) {
            _EnergyLayerQery = "select top 10000 * from ("
                + " select TotalRows = COUNT(*) OVER(),ROW_NUMBER() OVER (ORDER BY SortNumber,LayerName) AS ROW_NUM,EL.* from EnergyLayers EL where EnergyLayerID in ("
                + " select LCT.EnergyLayerID from Category CT,Layer_Categories LCT"
                + " where CT.CategoryID=LCT.CategoryID"
                + " and CT.CategoryID=" + param.CategoryIdForFilter + ")"
                + " and EL.IsEnabled=1"
                + " and (EL.LayerTypeID is not null or EL.LayerTypeID != '')"
                + " and EL.LayerGroupID in (select ELG.LayerGroupID from EnergyLayerGroups ELG where LayerGroup='" + param.LayerGroup + "')"
                // + " and EL.IsCheckBoxNeeded =1"
                // + " and EL.IsIconVisible=1"
                // + " and (EL.IsHaschild=0 or EL.IsHaschild is null)"
                + " ) x where x.ROW_NUM>0";
        } else {
            _EnergyLayerQery = "select top 25 * from ("
                + " select TotalRows = COUNT(*) OVER(),ROW_NUMBER() OVER (ORDER BY SortNumber,LayerName) AS ROW_NUM,EL.* from EnergyLayers EL where EnergyLayerID in ("
                + " select LCT.EnergyLayerID from Category CT,Layer_Categories LCT"
                + " where CT.CategoryID=LCT.CategoryID"
                + " )"
                + " and EL.IsEnabled=1"
                + " and (EL.LayerTypeID is not null or EL.LayerTypeID != '')"
                + " and EL.LayerGroupID in (select ELG.LayerGroupID from EnergyLayerGroups ELG where LayerGroup='" + param.LayerGroup + "')"
                // + " and EL.IsCheckBoxNeeded =1"
                // + " and EL.IsIconVisible=1"
                // + " and (EL.IsHaschild=0 or EL.IsHaschild is null)"
                + " ) x where x.ROW_NUM>" + param.skip;
        }
        return _EnergyLayerQery;
    },
    GetMyDataLibraryQuery: function (userId) {
        let query = "SELECT "
            + "[Description]"
            + ", [FilePathLocation]"
            + ", [FillColor]"
            + ", [IconType]"
            + ", [DataSetID]"
            + ", [IsEnabled]"
            + ", [IsFolder]"
            + ", [IsPublic]"
            + ", [Count]"
            + ", [DataSetGUID]"
            + ", [DataSetName]"
            + ", [ModifiedDate]"
            + ", [UploadedDate]"
            + ", [Opacity]"
            + ", [PreviewImage]"
            + ", [SizePercent]"
            + ", [StrokeColor]"
            + ", [StrokeThicknessPercent]"
            + ", [UploadFileType]"
            + ", [UploadedBy]"
            + ", [RepresentationType]"
            + ", [TableName]"
            + ", [FilterValue]"
            + ", [LayerTypeID]"
            + ", [DBFProperties]"
            + ", [PropertyTypes]"
            + ", [BBox]"
            + ", [DetailPanelProperties]"
            + ", [IsSaveSearch]"
            + ", [IsLabelVisible]"
            + ", [LabelField]"
            + ", [DateIS]"
            + ", [ExternalIconId]"
            + ", [IsIconDisabled]"
            + ", [ZoomMin]"
            + ", [ZoomMax]"
            + ", [ParentDataSetID]"
            + ", case when [UploadedBy]= '" + userId + "' then 'Private Layer' else 'Public Layer' end as LayerType"
            + ", (select Top 1 DisplayName from Users where UserID='" + userId + "') as UploaderDisplayName"
            + " FROM [dbo].[DataSets] WHERE [UploadedBy]='" + userId + "' and [IsEnabled]=1 and ([IsDeleted]=1 or [IsDeleted] is null) and [ParentDataSetID] is null ORDER BY [DataSetID] desc"
        return query;
    },
    RemoveDataInDataSetQuery: function (dataSetId) {
        let query = " Update [dbo].[DataSets] set [IsEnabled]=0 where [DataSetID]=" + dataSetId;
        return query;
    },
    UpdateMyDataLayerQuery: function (param) {
        let query = " Update [dbo].[DataSets] set [DataSetName]='" + param.DataSetName + "', [Description]='" + param.Description + "', [IsPublic]=" + (param.isShare ? 1 : 0) + " where [DataSetID]=" + param.layerId + " and [UploadedBy]='" + param.userId + "'";
        return query;
    },
    GetBaseMapDataQuery: function () {
        // let query = "SELECT [BaseMapProviderID]"
        //     + ",[Name]"
        //     + ",[BaseUri]"
        //     + ",[Description]"
        //     + ",[IsEnabled]"
        //     + ",Replace([PreviewImage], 'http://envision.mapsearch.com','https://api.envisionmaps.com:8080') as PreviewImage"
        //     + ",[IsExtendedWMS]"
        //     + ",[Layers]"
        //     + ",[TileSources]"
        //     //+ ",[Image]"
        //     + ",[IsDefault] "
        //     + " FROM [dbo].[BaseMapProviders] WHERE IsEnabled = 1 ORDER BY [Order]";
        let query = "select BaseMapProviderID,[Name],[Description],Replace([PreviewImage], 'http://envision.mapsearch.com','http://node.envisionmaps.net/') as PreviewImage,TileSources,[Order],IsEnabled,IsDefault,ForegroundColor,ShadowColor,IsExtendedWMS,BaseUri,Layers,[Parameters],MinZoom,MaxZoom,Note FROM [dbo].[BaseMapProviders] WHERE IsEnabled = 1 ORDER BY [Order]";
        return query;
    },
    GetMapSettingQuery: function (UserId) {
        let Query = " SELECT top 1 [MSID] " +
            " ,[UserId]" +
            " ,[BaseMapProviderID]" +
            " FROM [MapSettings] where USERID='" + UserId + "'";
        return Query;
    },
    InsertMapSetting(UserId, BaseMapProviderID) {
        let Query = "IF (NOT EXISTS(SELECT top 1 * FROM [MapSettings] where USERID='" + UserId + "'))" +
            " BEGIN   insert into [MapSettings] ([UserId],[BaseMapProviderID]) values ('" + UserId + "'," + BaseMapProviderID + "); " +
            " END ELSE  BEGIN " +
            " update [MapSettings] set " +
            " [BaseMapProviderID]=" + BaseMapProviderID +
            " where USERID='" + UserId + "' " +
            " END;" +
            " SELECT top 1 * FROM [MapSettings] where USERID='" + UserId + "'"
        return Query;
    },
    GetUserDetailsQuery: function (UserId) {
        let Query = "select u.DisplayName,u.UserName,u.Email from users as u where Userid='" + UserId + "'";
        return Query;
    },
    GetAllExternalIcon: function (param) {
        return " Select [Id],[Icon] ,[FileName] ,[Extension],[UploadedBy],[Uploaded],[IsDeleted],[RightLevel] from [dbo].[ExternalIcons] WHERE [UploadedBy] ='" + param.UserId + "' and [IsDeleted]=0 ";
    },
    DeleteExternalIcon: function (param) {
        let query = " Update [dbo].[ExternalIcons] set [IsDeleted]=1 where [UploadedBy]='" + param.UserId + "' and [Id]=" + param.IconID;
        return query;
    },
    GetInsertQuery: function (param) {
        var Insertquery = '';
        var EnergyLayerstyleByuser = param.JsonListofstyle;
        if (EnergyLayerstyleByuser.UserId && EnergyLayerstyleByuser.EnergyLayerId > 0) {
            if (!EnergyLayerstyleByuser.mapId) {
                if (EnergyLayerstyleByuser.IconType == "ExternalIcon" && param.externaliconURL != "") {
                    let icon = param.externaliconURL.split('.');
                    EnergyLayerstyleByuser.ExternalIconId = parseInt(icon[0]);
                }

                Insertquery = 'insert into [dbo].[EnergyLayerStylesByUser]' +
                    '([EnergyLayerId],[UserId],[IconType],[StrokeThicknessPercent],[StrokeColor],[FillColor],[SizePercent],[Opacity],[Created],[CreatedBy]' +
                    ',[IsLabelVisible],[LabelField],[DetailPanelProperties],[ExternalIconId])' +
                    'values (' + EnergyLayerstyleByuser.EnergyLayerId +
                    ",'" + EnergyLayerstyleByuser.UserId + "'" +
                    ",'" + EnergyLayerstyleByuser.IconType + "'" +
                    ',' + EnergyLayerstyleByuser.StrokeThicknessPercent +
                    ",'#" + EnergyLayerstyleByuser.StrokeColor.toUpperCase() + "'" +
                    ",'#" + EnergyLayerstyleByuser.FillColor.toUpperCase() + "'" +
                    ',' + EnergyLayerstyleByuser.SizePercent +
                    ',' + EnergyLayerstyleByuser.Opacity +
                    ',getdate()' +
                    ",'" + EnergyLayerstyleByuser.UserId + "'";

                if (EnergyLayerstyleByuser.LabelField) {
                    Insertquery += ",1";
                    Insertquery += ",'" + EnergyLayerstyleByuser.LabelField + "'";
                }
                else {
                    Insertquery += ",0";
                    Insertquery += ",null";
                }
                Insertquery += ",'" + decodeURIComponent(EnergyLayerstyleByuser.DetailPanelProperties) + "'";
                if (EnergyLayerstyleByuser["ExternalIconId"]) {
                    Insertquery += ',' + EnergyLayerstyleByuser.ExternalIconId;
                } else {
                    Insertquery += ',null';
                }

                Insertquery += ')';
            }
            else {
                if (EnergyLayerstyleByuser.IconType == "ExternalIcon" && param.externaliconURL != "") {
                    let icon = param.externaliconURL.split('.');
                    EnergyLayerstyleByuser.ExternalIconId = parseInt(icon[0]);
                }

                Insertquery = 'insert into [dbo].[EnergyLayerStylesByUser]' +
                    '([EnergyLayerId],[UserId],[IconType],[StrokeThicknessPercent],[StrokeColor],[FillColor],[SizePercent],[Opacity],[Created],[CreatedBy]' +
                    ',[IsLabelVisible],[LabelField],[DetailPanelProperties],[ExternalIconId],[MapId])' +
                    'values (' + EnergyLayerstyleByuser.EnergyLayerId +
                    ",'" + EnergyLayerstyleByuser.UserId + "'" +
                    ",'" + EnergyLayerstyleByuser.IconType + "'" +
                    ',' + EnergyLayerstyleByuser.StrokeThicknessPercent +
                    ",'#" + EnergyLayerstyleByuser.StrokeColor.toUpperCase() + "'" +
                    ",'#" + EnergyLayerstyleByuser.FillColor.toUpperCase() + "'" +
                    ',' + EnergyLayerstyleByuser.SizePercent +
                    ',' + EnergyLayerstyleByuser.Opacity +
                    ',getdate()' +
                    ",'" + EnergyLayerstyleByuser.UserId + "'";

                if (EnergyLayerstyleByuser.LabelField) {
                    Insertquery += ",1";
                    Insertquery += ",'" + EnergyLayerstyleByuser.LabelField + "'";
                }
                else {
                    Insertquery += ",0";
                    Insertquery += ",null";
                }
                Insertquery += ",'" + decodeURIComponent(EnergyLayerstyleByuser.DetailPanelProperties) + "'";
                if (EnergyLayerstyleByuser["ExternalIconId"]) {
                    Insertquery += ',' + EnergyLayerstyleByuser.ExternalIconId;
                } else {
                    Insertquery += ',null';
                }
                if (EnergyLayerstyleByuser.mapId) {
                    Insertquery += ',' + EnergyLayerstyleByuser.mapId;
                } else {
                    Insertquery += ',null';
                }
                Insertquery += ')';

            }
        }
        return Insertquery;
    },
    GetUpdateQuery: function (param) {
        let UpdateQery = '';
        let EnergyLayerstyleByuser = param.JsonListofstyle;
        if (EnergyLayerstyleByuser.UserId && EnergyLayerstyleByuser.EnergyLayerId > 0) {
            if (!EnergyLayerstyleByuser.mapId) {
                if (EnergyLayerstyleByuser.IconType == "ExternalIcon" && param.externaliconURL != "") {
                    let icon = param.externaliconURL.split('.');
                    EnergyLayerstyleByuser.ExternalIconId = parseInt(icon[0]);
                }
                UpdateQery = " update [dbo].[EnergyLayerStylesByUser] set " +
                    "[EnergyLayerId] =" + EnergyLayerstyleByuser.EnergyLayerId +
                    ", [UserId]='" + EnergyLayerstyleByuser.UserId + "'" +
                    ", [IconType]='" + EnergyLayerstyleByuser.IconType + "'" +
                    ", [StrokeThicknessPercent]=" + EnergyLayerstyleByuser.StrokeThicknessPercent +
                    ", [StrokeColor]='#" + EnergyLayerstyleByuser.StrokeColor.toUpperCase() + "'" +
                    ", [FillColor]='#" + EnergyLayerstyleByuser.FillColor.toUpperCase() + "'" +
                    ", [SizePercent]=" + EnergyLayerstyleByuser.SizePercent +
                    ", [Opacity]=" + EnergyLayerstyleByuser.Opacity +
                    ", [Updated]=getdate()" +
                    ", [UpdatedBy]='" + EnergyLayerstyleByuser.UserId + "'";
                if (EnergyLayerstyleByuser.LabelField) {
                    UpdateQery += " ,[IsLabelVisible]=1";
                    UpdateQery += " ,[LabelField]='" + EnergyLayerstyleByuser.LabelField + "'";
                }
                else {
                    UpdateQery += " ,[IsLabelVisible]=0";
                    UpdateQery += " ,[LabelField]= null";
                }
                UpdateQery += " , [DetailPanelProperties]='" + decodeURIComponent(EnergyLayerstyleByuser.DetailPanelProperties) + "'";
                if (EnergyLayerstyleByuser["ExternalIconId"]) {
                    UpdateQery += " , [ExternalIconId]=" + EnergyLayerstyleByuser.ExternalIconId;
                } else {
                    UpdateQery += " , [ExternalIconId]=null";
                }
                UpdateQery += " where [EnergyLayerId] = " + EnergyLayerstyleByuser.EnergyLayerId + " and [UserId] = '" + EnergyLayerstyleByuser.UserId + "' and (mapid is null or mapid='')";
            }
            else {
                if (EnergyLayerstyleByuser.IconType == "ExternalIcon" && param.externaliconURL != "") {
                    let icon = param.externaliconURL.split('.');
                    EnergyLayerstyleByuser.ExternalIconId = parseInt(icon[0]);
                }
                UpdateQery = " update [dbo].[EnergyLayerStylesByUser] set " +
                    "[EnergyLayerId] =" + EnergyLayerstyleByuser.EnergyLayerId +
                    ", [UserId]='" + EnergyLayerstyleByuser.UserId + "'" +
                    ", [IconType]='" + EnergyLayerstyleByuser.IconType + "'" +
                    ", [StrokeThicknessPercent]=" + EnergyLayerstyleByuser.StrokeThicknessPercent +
                    ", [StrokeColor]='#" + EnergyLayerstyleByuser.StrokeColor.toUpperCase() + "'" +
                    ", [FillColor]='#" + EnergyLayerstyleByuser.FillColor.toUpperCase() + "'" +
                    ", [SizePercent]=" + EnergyLayerstyleByuser.SizePercent +
                    ", [Opacity]=" + EnergyLayerstyleByuser.Opacity +
                    ", [Updated]=getdate()" +
                    ", [UpdatedBy]='" + EnergyLayerstyleByuser.UserId + "'";
                if (EnergyLayerstyleByuser.LabelField) {
                    UpdateQery += " ,[IsLabelVisible]=1";
                    UpdateQery += " ,[LabelField]='" + EnergyLayerstyleByuser.LabelField + "'";
                }
                else {
                    UpdateQery += " ,[IsLabelVisible]=0";
                    UpdateQery += " ,[LabelField]= null";
                }
                UpdateQery += " , [DetailPanelProperties]='" + decodeURIComponent(EnergyLayerstyleByuser.DetailPanelProperties) + "'";
                if (EnergyLayerstyleByuser["ExternalIconId"]) {
                    UpdateQery += " , [ExternalIconId]=" + EnergyLayerstyleByuser.ExternalIconId;
                } else {
                    UpdateQery += " , [ExternalIconId]=null";
                }
                UpdateQery += " where [EnergyLayerId] = " + EnergyLayerstyleByuser.EnergyLayerId + " and [UserId] = '" + EnergyLayerstyleByuser.UserId + "' and mapid=" + EnergyLayerstyleByuser.mapId;
            }
        }
        return UpdateQery;
    },
    GetPipelineWizardQuery: function () {
        var queryofTableName =
            "SELECT" +
            " CASE" +
            " WHEN (SELECT COUNT(*) FROM SystemParameters where SystemParameterName = 'PipelineTableName') > 0 THEN (SELECT TOP 1 SystemParameterValue FROM SystemParameters where SystemParameterName = 'PipelineTableName')" +
            " ELSE" +
            " (SELECT" +
            " CASE" +
            " WHEN (SELECT COUNT(*) FROM  EnergyLayers where LayerGroupID = 6 and LayerName = 'Pipelines search results') > 0 THEN (SELECT TableName FROM  EnergyLayers where LayerGroupID = 6 and LayerName = 'Pipelines search results')" +
            " ELSE ''" +
            " END)" +
            " END as TableName";
        return queryofTableName;
    },
    GetPrivateLayerSaveStyleQuery: function (param) {
        var PrivateLayerstyleByuser = param.JsonListofstyle;
        var GetSqlquery = "select top 1 [DatasetID] as EnergyLayerId,* from [dbo].[DataSets] where [DataSetID]=" + PrivateLayerstyleByuser.DataSetID + " and  [UploadedBy]='" + PrivateLayerstyleByuser.UploadedBy + "'"
        let Updatequery = this.GetUpdatedPrivateLayerstyleQuery(param);
        if (Updatequery) {
            let query = " IF (EXISTS(" + GetSqlquery + ")) " +
                " BEGIN " + Updatequery + " END; " + GetSqlquery;
            GetSqlquery = query;
        }
        return GetSqlquery;
    },
    GetUpdatedPrivateLayerstyleQuery: function (param) {
        let UpdateQuery = "";
        let PrivateLayerstyleByuser = param.JsonListofstyle;
        if (PrivateLayerstyleByuser.UploadedBy && PrivateLayerstyleByuser.DataSetID > 0) {
            if (PrivateLayerstyleByuser.IconType == "ExternalIcon" && param.externaliconURL != "") {
                let icon = param.externaliconURL.split('.');
                PrivateLayerstyleByuser.ExternalIconId = parseInt(icon[0]);
            }
            UpdateQuery = " Update [dbo].[DataSets] set " +
                "[DataSetName]='" + PrivateLayerstyleByuser.DataSetName + "'" +
                ",[Description]='" + PrivateLayerstyleByuser.Description + "'" +
                ",[UploadedBy]='" + PrivateLayerstyleByuser.UploadedBy + "'";
            UpdateQuery += ",IsPublic=" + (PrivateLayerstyleByuser.IsPublic ? 1 : 0);
            UpdateQuery += ",IconType='" + PrivateLayerstyleByuser.IconType + "'" +
                ",StrokeThicknessPercent=" + PrivateLayerstyleByuser.StrokeThicknessPercent +
                ", [StrokeColor]='#" + PrivateLayerstyleByuser.StrokeColor.toUpperCase() + "'" +
                ", [FillColor]='#" + PrivateLayerstyleByuser.FillColor.toUpperCase() + "'" +
                ", [SizePercent]=" + PrivateLayerstyleByuser.SizePercent +
                ", [Opacity]=" + PrivateLayerstyleByuser.Opacity +
                ",[ModifiedDate]=getdate()";
            if (PrivateLayerstyleByuser.LabelField) {
                UpdateQuery += " ,[IsLabelVisible]=1";
                UpdateQuery += " ,[LabelField]='" + PrivateLayerstyleByuser.LabelField + "'";
            }
            else {
                UpdateQuery += " ,[IsLabelVisible]=0";
                UpdateQuery += " ,[LabelField]= null";
            }
            UpdateQuery += " , [DetailPanelProperties]='" + decodeURIComponent(PrivateLayerstyleByuser.DetailPanelProperties) + "'";
            if (PrivateLayerstyleByuser["ExternalIconId"]) {
                UpdateQuery += " , [ExternalIconId]=" + PrivateLayerstyleByuser.ExternalIconId;
            } else {
                UpdateQuery += " , [ExternalIconId]=null";
            }
            UpdateQuery += " where [DataSetID]=" + PrivateLayerstyleByuser.DataSetID + " and  [UploadedBy]='" + PrivateLayerstyleByuser.UploadedBy + "'";
        }
        return UpdateQuery;
    },
    GetGlobalEnergyLayerquery: function (param, layerCategoryIdsBasedOnRole) {
        let Query = "  select TotalRows = COUNT(*) OVER()" +
            " ,ROW_NUMBER() OVER (ORDER BY SortNumber) AS ROW_NUM" +
            " ,EL.* " +
            " from EnergyLayers EL " +
            " where EnergyLayerID " +
            " in (select LCT.EnergyLayerID from Category CT,Layer_Categories LCT where CT.CategoryID=LCT.CategoryID and CT.CategoryID in (" + layerCategoryIdsBasedOnRole + "))  " +
            " and EL.IsEnabled=1 and (EL.LayerTypeID is not null or EL.LayerTypeID != '') " +
            " and EL.LayerGroupID in (select ELG.LayerGroupID from EnergyLayerGroups ELG where LayerGroup='" + param.LayerGroup + "')  " +
            " and (EL.LayerName like '%" + decodeURIComponent(param.SearchText) + "%' or EL.DisplayName like '%" + decodeURIComponent(param.SearchText) + "%' or El.Tags like '%" + decodeURIComponent(param.SearchText) + "%') ";
        return Query;
    },
    InsertDataSetsDataQuery: function (param) {
        let Query = "Insert into DataSets (DataSetName,Description,UploadedBy,UploadedDate,Tags,IsPublic,PreviewImage,UploadFileType,FilePathLocation,IconType,StrokeThicknessPercent,StrokeColor" +
            ",FillColor,SizePercent,Opacity,IsEnabled,SortNumber,DataSetGUID,ModifiedDate,Count,RepresentationType,TableName,FilterValue,LayerTypeID,DBFProperties,DetailPanelProperties" +
            ",IsSaveSearch,IsLabelVisible)";
        Query += " values ";
        Query += "('" + param.DataSetName + "','" + param.Description + "','" + param.UploadedBy + "',GETDATE(),'" + param.Tags + "',convert(bit,'" + param.IsPublic + "'),'" + param.PreviewImage + "','" + param.UploadFileType + "'," +
            "'" + param.FilePathLocation + "','" + param.IconType + "'," + param.StrokeThicknessPercent + ",'" + param.StrokeColor + "','" + param.FillColor + "'," + param.SizePercent + "," + param.Opacity + ",CONVERT(bit, '" + param.IsEnabled + "')," +
            param.SortNumber + ",'" + param.DataSetGUID + "',GETDATE()," + param.Count + ", '" + param.RepresentationType + "', '" + param.TableName + "', '" + param.FilterValue + "'," + param.LayerTypeID + "," +
            "'" + param.DBFProperties + "','" + param.DetailPanelProperties + "',CONVERT(bit,'" + param.IsSaveSearch + "'),CONVERT(bit,'" + param.IsLabelVisible + "'))";


        return Query;
    },
    GetMapbyUserQuery: function (param) {
        // let Query = "select cusmap.CustomMapId,cusmap.[Name],cusmap.[Description],cusmap.Modified as Created,UserData.DisplayName as UserName,cusmap.UserId,cusmap.CenterLatitude,cusmap.CenterLongitude,cusmap.ZoomLevel,'sharedmap' as [Type],cusmap.IsPublic" +
        //     " from CustomMaps as cusmap" +
        //     " outer apply (select DisplayName from Users where UserId=cusmap.UserId) UserData" +
        //     " right join CustomMaps_CooperativeUsers as b on cusmap.custommapid=b.mapid " +
        //     " where b.UserGuid='" + param.UserID + "'" +
        //     " and cusmap.IsDeleted=convert(bit,'false')" +
        //     " UNION ALL" +
        //     " select cusmap.CustomMapId,cusmap.[Name],cusmap.[Description],cusmap.Modified as Created,UserData.DisplayName as UserName,cusmap.UserId,cusmap.CenterLatitude,cusmap.CenterLongitude,cusmap.ZoomLevel,'mymap' as [Type],cusmap.IsPublic" +
        //     " from CustomMaps as cusmap " +
        //     " outer apply (select DisplayName from Users where UserId=cusmap.UserId) UserData" +
        //     " where cusmap.UserId='" + param.UserID + "'" +
        //     " and cusmap.IsDeleted=convert(bit,'false') order by cusmap.Modified desc";
        let Query = "select cm.CustomMapId,cm.[Name],cm.[Description],cm.Modified as Created,UserData.DisplayName as UserName,cm.UserId,cm.CenterLatitude,cm.CenterLongitude,cm.ZoomLevel,'sharedmap' as [Type],cm.IsPublic from CustomMaps cm " +
            "outer apply " +
            "(" +
            "select DisplayName from Users where UserId=cm.UserId" +
            ") UserData " +
            "where " +
            "(" +
            "cm.CustomMapId in(select cou.MapID from CustomMaps_CooperativeUsers cou where cou.UserGuid = '" + param.UserID + "')" +
            "or" +
            "(select count(*)  from CustomMaps_CooperativeUsers coua where coua.MapID = cm.CustomMapId) = 0" +
            ")" +
            "and " +
            "(" +
            "cm.IsDeleted = 0" +
            "and " +
            "cm.UserId in (select cu.UserGuid from CustomerUsers cu where cu.CustomerID=343 and cu.UserGuid != '" + param.UserID + "')" +
            "and " +
            "cm.IsPublic = 1" +
            ")" +
            "UNION ALL " +
            "select " +
            "cusmap.CustomMapId,cusmap.[Name],cusmap.[Description],cusmap.Modified as Created,UserData.DisplayName as UserName,cusmap.UserId,cusmap.CenterLatitude,cusmap.CenterLongitude,cusmap.ZoomLevel,'mymap' as [Type],cusmap.IsPublic from CustomMaps as cusmap  " +
            "outer apply " +
            "(" +
            "select DisplayName from Users where UserId=cusmap.UserId" +
            ") UserData " +
            "where cusmap.UserId='" + param.UserID + "' and cusmap.IsDeleted=convert(bit,'false') " +
            "order by cm.Modified desc";
        return Query
    },
    GetCompnayNameByUserId: function (UserID) {
        let query = "SELECT cus.CustomerName,cus.CustomerID  FROM [MapSearchAttributes].[dbo].[CustomerUsers] cusUser,Customer as cus  where cusUser.[CustomerID]=cus.[CustomerID] and cusUser.UserGuid='" + UserID + "'";
        return query;
    },
    GetUserListbasedonCompanyId: function (UserID, CustomerID) {
        let Query = "";
        if (CustomerID > 0) {
            let Condition = " CustomerID=" + CustomerID;
            if (UserID) {
                Condition += " and UserGuid != '" + UserID + "') and IsApproved=1 and IsDeleted=0 ";
            }
            else {
                Condition += ")and IsApproved=1 and IsDeleted=0 ";
            }
            Query = "select CASE when convert(nvarchar(max),DisplayName) ='' then Username else DisplayName end as DisplayName ,UserId from Users where UserId in (select UserGuid  from [CustomerUsers] where " + Condition;
            Query = "select * from(" + Query + " ) e order by  convert(nvarchar(max),DisplayName)";

        }
        return Query;

    },
    GetEnergyLayesById: function (LayerId) {
        let Query = "select * from [MapSearchAttributes].[dbo].[EnergyLayers] as eng where eng.[EnergyLayerID]=" + LayerId;
        return Query;
    },
    GetEnergyLayesParentsById: function (EnergyParentID) {
        let Query = "select * from [MapSearchAttributes].[dbo].[EnergyLayers] as eng where eng.EnergyParentID=" + EnergyParentID + " and eng.IsEnabled=1"
        return Query;
    },
    GetExternalIcon: function (userId, externalIconId) {
        let query = "  select * from [MapSearchAttributes].[dbo].[ExternalIcons] where [UploadedBy] = '" + userId + "' and [IsDeleted] = 0 and [Id] = " + externalIconId;
        return query;
    },
    GetEnergyLayerStyleByUserById: function (layerId, userId) {
        let query = "select top 1 * from [MapSearchAttributes].[dbo].[EnergyLayerStylesByUser] where [EnergyLayerId] = " + layerId + " and [UserId]='" + userId + "' order by [Created]"
        return query;
    },
    GetExternalIconByUserId: function (userId) {
        let query = "  select [Id],[FileName],[Extension],[UploadedBy],[Uploaded],[IsDeleted],[RightLevel] from [MapSearchAttributes].[dbo].[ExternalIcons] where [UploadedBy] = '" + userId + "' and [IsDeleted] = 0";
        return query;
    },
    GetSharedDataByUserQuery: function (userId) {
        let query = "select ds.DataSetID, ds.DataSetName, ds.Description, CASE WHEN ds.IsPublic = 1 THEN 'Public Layer'  ELSE 'Private Layer' END as Type, ds.UploadFileType, u.DisplayName as UserName, u.UserId, ds.UploadedDate,ds.ModifiedDate from [MapSearchAttributes].[dbo].[DataSets] ds, [MapSearchAttributes].[dbo].[Users] u " +
            "where ds.UploadedBy = u.UserId and ds.[IsEnabled] = 1 and ds.IsPublic = 1 and ds.ParentDataSetID is null and ds.UploadedBy != '" + userId + "' and ds.UploadedBy in" +
            "(select UserGuid from [MapSearchAttributes].[dbo].[CustomerUsers] where CustomerID in " +
            "(select CustomerID from [MapSearchAttributes].[dbo].[CustomerUsers] where [UserGuid]='" + userId + "')) " +
            "order by ds.ModifiedDate desc";
        return query;
    },
    GetDrawingToolQuery: function (layerId) {
        let query = "SELECT Id ,ShapeType ,SubType ,Name ,Description ,FontSize ,Color ,StrokeThickness ,BackColor ,Opacity ,ShapeGeo.ToString() as ShapeGeo ,UserId ,Visible ,HTML_EditableLayerID ,LineStyle ,Radius FROM HTML_DrawTools where HTML_EditableLayerID = '" + layerId + " ' and IsDeleted = 0";
        return query;
    },
    CheckLayerNameInDrawingLayerExistsOrNotQuery: function (data) {
        let layerId = data.layerID;
        let editableLayer = data.editableLayer;
        let query = "SELECT EditableLayerID ,Name ,Description ,UserGuid ,CreatedTime ,IsDeleted ,DiagramData ,isShared FROM HTML_EditableLayers where UserGuid = '" + editableLayer.UserGuid + "' and IsDeleted = '0' and EditableLayerID != " + layerId + " and Name = '" + editableLayer.Name + "'";
        return query;
    },
    GetSharedDrawingLayerQuery: function (users, UserId) {
        let userIds = '';
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            if (user && user.UserId)
                userIds += "'" + user.UserId + "'";
            if (i != (users.length - 1))
                userIds += ', ';
        }
        let query = "SELECT b.EditableLayerID ,b.Name ,b.Description ,b.UserGuid ,b.CreatedTime ,b.IsDeleted ,b.DiagramData ,b.isShared from HTML_EditableLayers b where b.EditableLayerID not in (select a.HTML_EditableLayerID from HTML_EditableLayers_SharedExcluded a where a.UserGuid='" + UserId + "' and a.IsDeleted=1) and b.IsDeleted = 0  and b.isShared = 1 and  b.UserGuid in (" + userIds + ")";
        return query;
    }
}

