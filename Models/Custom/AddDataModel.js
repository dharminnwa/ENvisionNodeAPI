class UserDataModel {
    constructor(IsApproved, UserGuid, UserName, EMailAddress, DirectRoles, EffectiveRoles, CustomerId, CustomerName, CustomerRoles, CustomerIsDeleted, IsEnabled, IsUserLocked, Password, AcceptedExcelExportAggreement, IsKickedOut, SystemParameters, LoginHandlerId, KeepmeLogin) {
        this.IsApproved = IsApproved;
        this.UserGuid = UserGuid;
        this.UserName = UserName;
        this.EMailAddress = EMailAddress;
        this.DirectRoles = DirectRoles;
        this.EffectiveRoles = EffectiveRoles;
        this.CustomerId = CustomerId;
        this.CustomerName = CustomerName;
        this.CustomerRoles = CustomerRoles;
        this.CustomerIsDeleted = CustomerIsDeleted;
        this.IsEnabled = IsEnabled;
        this.IsUserLocked = IsUserLocked;
        this.Password = Password;
        this.AcceptedExcelExportAggreement = AcceptedExcelExportAggreement;
        this.IsKickedOut = IsKickedOut;
        this.SystemParameters = SystemParameters;
        this.LoginHandlerId = LoginHandlerId;
        this.KeepmeLogin = KeepmeLogin;
    }
};

class ShapeFileUploadModel {
    constructor(FileType, ShapeId, IsChecked, ShapeDescription, ShapeName, ShapeFileName, ShapeFilePath, IconType, RepresentationType, Feedback) {
        this.FileType = FileType
        this.ShapeId = ShapeId
        this.IsChecked = IsChecked
        this.ShapeDescription = ShapeDescription
        this.ShapeName = ShapeName
        this.ShapeFileName = ShapeFileName
        this.ShapeFilePath = ShapeFilePath
        this.IconType = IconType
        this.RepresentationType = RepresentationType
        this.Feedback = Feedback
    }
}

class FileSourceModel {
    constructor(FileName, FileExtention, FilePath) {
        this.FileName = FileName
        this.FileExtention = FileExtention
        this.FilePath = FilePath
    }
}

class DataSetModel {
    constructor(DataSets, DataSetName, Description, UploadedBy, UploadedDate, ModifiedDate, PublishedDate, Source, Citation, Tags, Attributes, IsPublic, PreviewImage, FilesIncluded, IconType, RepresentationType, StrokeThicknessPercent, StrokeColor, FillColor, SizePercent, Opacity, IsEnabled, SortNumber, DataSetGUID, IsSaveSearch, LayerTypeID, TableName, UploadFileType, FilePathLocation, DBFProperties, DetailPanelProperties) {
        this.DataSets = DataSets
        this.DataSetName = DataSetName
        this.Description = Description
        this.UploadedBy = UploadedBy
        this.UploadedDate = UploadedDate
        this.ModifiedDate = ModifiedDate
        this.PublishedDate = PublishedDate
        this.Source = Source
        this.Citation = Citation
        this.Tags = Tags
        this.Attributes = Attributes
        this.IsPublic = IsPublic
        this.PreviewImage = PreviewImage
        this.FilesIncluded = FilesIncluded
        this.IconType = IconType
        this.RepresentationType = RepresentationType
        this.StrokeThicknessPercent = StrokeThicknessPercent
        this.StrokeColor = StrokeColor
        this.FillColor = FillColor
        this.SizePercent = SizePercent
        this.Opacity = Opacity
        this.IsEnabled = IsEnabled
        this.SortNumber = SortNumber
        this.DataSetGUID = DataSetGUID
        this.IsSaveSearch = IsSaveSearch
        this.LayerTypeID = LayerTypeID
        this.TableName = TableName
        this.UploadFileType = UploadFileType
        this.FilePathLocation = FilePathLocation
        this.DBFProperties = DBFProperties
        this.DetailPanelProperties = DetailPanelProperties
    }
}

module.exports = {
    UserData: UserDataModel,
    ShapeFileUpload: ShapeFileUploadModel,
    FileSource: FileSourceModel,
    DataSet: DataSetModel
};