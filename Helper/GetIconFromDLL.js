var edge = require('edge-js');
module.exports =
    {
        GetImageIcon: edge.func({
            source: function () {
                /*
                    using System;
                    using System.Collections.Generic;
                    using System.Drawing;
                    using System.IO;
                    using System.Linq;
             
                   async (data) => {
                          LayerIconsGenerate.LayerIconModal modal = new  LayerIconsGenerate.LayerIconModal();
                          LayerIconsGenerate.LayerIcon _handler = new  LayerIconsGenerate.LayerIcon();
                         var input = (IDictionary<string, object>)data;            
                         modal.URLType = input["URLType"].ToString();
                         modal.Id = input["Id"].ToString();
                         modal.FillColor = input["FillColor"].ToString();
                         modal.IconType = input["IconType"].ToString();
                         modal.StrokeColor = input["StrokeColor"].ToString();
                         modal.SizePercent = Convert.ToDouble(input["SizePercent"].ToString());
                         modal.StrokeThicknessPercent = Convert.ToDouble(input["StrokeThicknessPercent"].ToString());
                         modal.Opacity = Convert.ToDouble(input["Opacity"].ToString());            
                          byte[] image = _handler.ProcessRequest(modal);             
                        return image;
                     }
             
                     */

            },
            references: [
                __dirname.replace("Helper", "") + "DLLS/LayerIconsGenerate.dll",
            ]
        })
    };