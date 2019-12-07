var config = require('config');
var EndpointloginUrl = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.UserController.UserLogin;
var EndpointlogoutUrl = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.UserController.UserLogout;
var EndPointTreeViewData = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.LayerController.GetLayerTreeViewData;
var EndpointPrivateLayerTreeView = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.AddDataController.PrivateLayerTree;
var ChangeCurrentUsersPassword = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.UserController.ChangeCurrentUsersPassword;
var CreateIcon = config.DotnetAPI.apiURL + config.DotnetAPI.ControllerAPI.UserController.CreateIcon;

module.exports =
    {
        CreateLoginURL: function (Param) {
            let URLParameter = "?UserName=" + encodeURIComponent(Param.UserName);
            URLParameter += "&Password=" + encodeURIComponent(Param.Password);
            URLParameter += "&IsPersistent=" + Param.KeepmeLogin;
            URLParameter += "&LogInType=" + Param.LogInType;
            URLParameter += "&AutoLogOutTimeInMinutes=" + Param.AutoLogOutTimeInMinutes;
            return EndpointloginUrl + URLParameter;
        },
        CreateLogoutURL: function (Param) {
            let URLParameter = "?LoginHandlerId=" + encodeURIComponent(Param.LoginHandlerId) + "&UserID=" + encodeURIComponent(Param.UserID);
            return EndpointlogoutUrl + URLParameter;
        },
        CreateGetTreeviewDataURL: function (Param) {
            let URLParameter = "?Layers=" + Param.Layers + "&UserId=" + Param.UserId;
            if (Param.CustomMapId)
                URLParameter += "&CustomMapId=" + Param.CustomMapId;
            if (Param.IsSiteSelectionTools)
                URLParameter += "&IsSiteSelectionTools=" + Param.IsSiteSelectionTools
            return EndPointTreeViewData + URLParameter;
        },
        CreateGetPrivateLayerTreeViewDataURL: function (Param) {
            let URLParameter = "?LayerId=" + Param.LayerId;
            return EndpointPrivateLayerTreeView + URLParameter;
        },
        ChangePasswordURL: function (OldPassword, NewPassword, UserId) {
            let URLParameter = "?OldPassword=" + encodeURIComponent(OldPassword) + "&NewPassword=" + encodeURIComponent(NewPassword) + "&UserID=" + encodeURIComponent(UserId);
            return ChangeCurrentUsersPassword + URLParameter;
        },
        GetIconURL: function (data) {
            let URLParameter = "?Id=" + data.Id + "&URLType=" + data.URLType + "&FillColor=" + data.FillColor + "&IconType=" + data.IconType + "&StrokeColor=" + data.StrokeColor + "&SizePercent=" + data.SizePercent + "&StrokeThicknessPercent=" + data.StrokeThicknessPercent + "&Opacity=" + data.Opacity;
            return CreateIcon + URLParameter;
        }

    };




