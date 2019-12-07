var edge = require('edge-js');
module.exports =
    {
        ConvertShapeFile: edge.func({
            source: function () {
                /*
                   using System.IO;
                   using System.Collections.Generic;
                   using DotSpatial.Data;
                   using DotSpatial.Projections;
                   using DotSpatial.Topology;
            
                  async (data) => {
                        bool isConverted = false;
                       try
                       {
                           var input = (dynamic)data;
                           string filepathwithName = System.IO.Path.Combine(input.DirectoryPath.ToString(), input.FileName.ToString());
                           DotSpatial.Data.IFeatureSet fs = DotSpatial.Data.FeatureSet.Open(filepathwithName);
                           fs.Reproject(DotSpatial.Projections.KnownCoordinateSystems.Geographic.World.WGS1984);
                           fs.SaveAs(filepathwithName, true);
                           isConverted = true;
                       }
                       catch (Exception ex)
                       {
                           throw ex;
                       }
                       return isConverted;
                   }
            
           */

            },
            references: [
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Data.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Projections.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Topology.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Mono.dll"
            ]
        }),

        ReadShapeFileAndGetShapeType: edge.func({
            source: function () {
                /*
                    using System;
                    using System.IO;
                    using ShapeType;

                async (filePath) => {    
                    int result = 0;
                    try
                    {
                        ShapeFile shapefile = new ShapeFile();
                        using(FileStream fileStream = File.OpenRead(filePath.ToString()))
                        {
                            MemoryStream memStream = new MemoryStream();
                            memStream.SetLength(fileStream.Length);
                            fileStream.Read(memStream.GetBuffer(), 0, (int)fileStream.Length);
                            shapefile.ReadShapeFileHeader(memStream);
                            result = shapefile.FileHeader.ShapeType;
                        }                        
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                    return result;
                }
                    */
            },
            references: [
                __dirname.replace("Helper", "") + "DLLS/ShapeType.dll",
            ]


        }),

        ReadKmlFileAndGetCoordinates: edge.func({
            source: function () {
                /*
                    using System;
                    using System.IO;
                    using ParseKML;

                async (inputData) => {    
                    KMLWebserviceDataContract result = new KMLWebserviceDataContract();
                    try
                    {
                        var input = (dynamic)inputData;
                        System.IO.MemoryStream data = new System.IO.MemoryStream();
                        System.IO.Stream str = File.OpenRead(input.FilePath.ToString());

                        str.CopyTo(data);
                        byte[] buf = new byte[data.Length];
                        data.Seek(0, SeekOrigin.Begin);
                        data.Read(buf, 0, buf.Length);
                        result = KML.UploadAndParseKML(buf, input.FileType.ToString());               
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                    return result;
                }
                    */
            },
            references: [
                __dirname.replace("Helper", "") + "DLLS/ParseKML.dll",
                __dirname.replace("Helper", "") + "DLLS/SharpKml.dll",
                __dirname.replace("Helper", "") + "DLLS/SharpKml.Kmz.dll",
            ]
        }),

        ReadExcelAndCreateShapefile: edge.func({
            source: function () {
                /*
                    using System;
                    using System.IO;
                    using ExcelToShapeFile;

                async (inputData) => {    
                    Result result = new Result();
                    try
                    {
                        var input = (dynamic)inputData;
                        //byte[] buf = { };
                        //using (MemoryStream data = new MemoryStream())
                        //using (System.IO.Stream str = File.OpenRead(input.UploadedFilePath))
                        //{
                        //    str.CopyTo(data);
                        //    buf = new byte[data.Length];
                        //    data.Seek(0, SeekOrigin.Begin);
                        //    data.Read(buf, 0, buf.Length);
                        //}
                        result = ParseExcel.ReadExcelFile(input.FileName, input.ShapeFilePath, input.UploadedDirectoryPath);               
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                    return result;
                }
                    */
            },
            references: [
                __dirname.replace("Helper", "") + "DLLS/ExcelToShapeFile.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Serialization.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Data.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Projections.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Topology.dll",
                __dirname.replace("Helper", "") + "DLLS/DotSpatial.Mono.dll"
            ]
        }),

    };