Date.prototype.Format = function(fmt)
{
   var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

var app = {
    debug:false,
    pluginToolPath:"/Plugins/plugin.media.compare.core.bundle",
    pluginBundleClass:"LibCommonInterface",

    supportInfo:"Copyright &#xa9;2013-2014. Romanysoft LAB. (Email:app.romanysoft@gmail.com)",
    errorMsg: "Oh! Get a error! \n",
    sendMsg:" Please send email to app.romanysoft@gmail.com \n",
    successMsg: "Recover success! \n",
    //////////////////////////////////////////////////////////////////////
    importFilePath:"",
    importFileNameWithoutExtension:"",
    exportFilePath:"",

    ds_importQueue:[],
    ds_exportQueue:[],

    ds_importInfos:[],
    ds_exportInfos:[],

    left_dataItem:null,
    right_dataItem:null,
    timestramp:0,

    /////////////////////////////////////////////////////////////////////
    handExecTaskUpdateCallback:null,
    handExecTaskUpdateCallbackFunc:function(obj) {
    	app.handExecTaskUpdateCallback && app.handExecTaskUpdateCallback(obj);
    },

    handImportFilesCallback:null,
    handImportFilesCallbackFunc:function(obj){
        app.handImportFilesCallback && app.handImportFilesCallback(obj);
    },

    handExportFilesCallback:null,
    handExportFilesCallbackFunc:function(obj){
        app.handExportFilesCallback && app.handExportFilesCallback(obj);
    },
    
    handDragDropCallback:null,
    onDragDropCallbackFunc:function(obj){
        app.handDragDropCallback && app.handDragDropCallback(obj);
    },     

    launch: function () {
        this.initPluginCore();
        this.initDragDropHandler();
        this.createControl();
    },

    initPluginCore:function(){
        try{
            var params = {
                useThread: true,
                passBack:'app.handExecTaskUpdateCallbackFunc',
                packageMode: 'bundle',
                taskToolPath: app.pluginToolPath,
                bundleClassName: app.pluginBundleClass,
                callMethod:'initCore',
                arguments:[true]
            };
            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.window.execTask(paramStr));
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
            }
        }catch(e){
            if(app.debug) alert(e);
            else console.log(e);
        }
    },

    initDragDropHandler:function(){
        try {
            var params = {callback: "app.onDragDropCallbackFunc"};
            var paramStr = JSON.stringify(params);
            (typeof maccocojs) && (maccocojs.window.setDragDropCallback(paramStr));
        } catch (e) {
            console.error(e)
        }

        try {
            var params = {enableDir: false};
            var paramStr = JSON.stringify(params);
            (typeof maccocojs) && (maccocojs.window.setDragDropAllowDirectory(paramStr));
        } catch (e) {
            console.error(e)
        }

        try {
            var params = {fileTypes: ["*"]};
            var paramStr = JSON.stringify(params);
            (typeof maccocojs) && (maccocojs.window.setDragDropAllowFileTypes(paramStr));
        } catch (e) {
            console.error(e)
        }

    },
        
    createControl:function(){
        $('#btn-import').kendoButton({});
        $('#btn-cancel').kendoButton({
            enable:false
        });
        $('#btn-export').kendoButton({
            enable:false
        });
        $('#btn-reveal').kendoButton({
            enable:false
        });
        $('#btn-clear').kendoButton({
            enable:false
        });

        /// 比较区域初始化
        app.updateImportFilesSelect(null);

        /// {进度条的初始化}
        $("#progressBar").kendoProgressBar({
            min: 0,
            max: 100,
            animation: {
                duration: 0
            },
            type: "percent"
        });

        ////////////////////////////////////////////////
        // Event Bind
        $('#btn-export').on('click', app.exportBtnClick);
        $('#btn-import').on('click', app.importBtnClick);
        $('#btn-cancel').on('click', app.cancelBtnClick);
        $('#btn-reveal').on('click', app.revealBtnClick);
        $('#btn-clear').on('click', app.clearBtnClick);
    },

    addImportFiles:function(files){
       var try_queueInfoID = ((new Date()).getTime()).toString();
        try{
            var params = {
                useThread: true,
                passBack:'app.handExecTaskUpdateCallbackFunc',
                packageMode: 'bundle',
                taskToolPath: app.pluginToolPath,
                bundleClassName: app.pluginBundleClass,
                callMethod:'importMediaFiles',
                arguments:[try_queueInfoID, files]
            };
            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.window.execTask(paramStr));
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
            }
        }catch(e){
            if(app.debug) alert(e);
            else console.log(e);
        }
    },

    sendQueueEvent:function(queueID, queueType, event){
        try{
            var params = {
                useThread: true,
                passBack:'app.handExecTaskUpdateCallbackFunc',
                packageMode: 'bundle',
                taskToolPath: app.pluginToolPath,
                bundleClassName: app.pluginBundleClass,
                callMethod:'sendEvent',
                arguments:[event, queueType, queueID]
            };
            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.window.execTask(paramStr));
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
            }
        }catch(e){
            if(app.debug) alert(e);
            else console.log(e);
        }
    },

    updateImportFilesSelect:function(infoData){
        var ds_info = infoData || [];

        var appTabs = $('#app-tabs');
        var ctemplate = kendo.template($("#appTabs-template").html());
        appTabs.html(ctemplate(ds_info));

        $('#import-file-left').kendoDropDownList({
            dataTextField: "filePath",
            dataValueField: "filePath",
            dataSource: ds_info,
            index: 0,
            select:function(e){
                var dataItem = this.dataItem(e.item.index());
                app.left_dataItem = dataItem;
                app.updateCompareView();
            }
        });


        $('#import-file-right').kendoDropDownList({
            dataTextField: "filePath",
            dataValueField: "filePath",
            dataSource: ds_info,
            index: ds_info.length -1,
            select:function(e){
                var dataItem = this.dataItem(e.item.index());
                app.right_dataItem = dataItem;
                app.updateCompareView();
            }
        });

        app.left_dataItem = $('#import-file-left').data('kendoDropDownList').dataItem(0);
        app.right_dataItem = $('#import-file-right').data('kendoDropDownList').dataItem(ds_info.length -1);
        app.updateCompareView();

    },

    updateCompareView:function(){
        if(!app.left_dataItem && !app.right_dataItem) return;

        //var leftContent = JSON.stringify(app.left_dataItem.mediaInfo);
        var leftContent = app.left_dataItem.mediaInfo;
        //var rightContent = JSON.stringify(app.right_dataItem.mediaInfo);
        var rightContent = app.right_dataItem.mediaInfo;

        var base = difflib.stringAsLines(leftContent);
        var compare = difflib.stringAsLines(rightContent);
        var sm = new difflib.SequenceMatcher(base, compare);
        var opcodes = sm.get_opcodes();

        var diffView = diffview.buildView({
            baseTextLines:base,
            newTextLines:compare,
            opcodes:opcodes,
            baseTextName:app.left_dataItem.filePath,
            newTextName:app.right_dataItem.filePath,
            contextSize:null,
            viewType:0
        });

        $('#compare-result').html("");
        $('#compare-result').append(diffView);
    },

    updateProgress:function(infoData){
        $("#progressBar").data("kendoProgressBar").value(infoData.progress);
    },

    importBtnClick:function(){
        var params = {
            callback:"app.handImportFilesCallbackFunc",
            allowOtherFileTypes:false,
            canChooseDir:true,
            allowMulSelection:true,
            title:"Import files",
            prompt:"Import",
            types:[]
        };
        var paramStr = JSON.stringify(params);
        try {
            (typeof maccocojs) && (maccocojs.window.openFile(paramStr));
        } catch (e) {
            if(app.debug) alert(e);
            else console.error(e);
        }
    },

    clearBtnClick:function(){
        app.ds_importInfos = [];
        app.updateImportFilesSelect(app.ds_importInfos);
        $('#compare-result').html("");
        app.updateProgress({progress:0});

        $('#btn-reveal').data('kendoButton').enable(false);
        $('#btn-export').data('kendoButton').enable(false);
        $('#btn-cancel').data('kendoButton').enable(false);
        $('#btn-clear').data('kendoButton').enable(false);
    },

    exportBtnClick:function(){
        if (app.ds_importInfos.length < 1) return;
        try{
            var params = {
                callback: 'app.handExportFilesCallbackFunc',
                fileName: "MediaInfo_diff_Report",
                allowOtherFileTypes:false,
                title:"Export result to html file",
                prompt:"Export",
                types: ['html']
            };
            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.window.saveFile(paramStr));
                $('#btn-reveal').data('kendoButton').enable(false);
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
            }
        }catch(e){
            if(app.debug) alert(e);
            else console.log(e);
        }

    },
    cancelBtnClick:function(){
        try{
            var params = {
                useThread: true,
                passBack:'app.handExecTaskUpdateCallbackFunc',
                packageMode: 'bundle',
                taskToolPath: app.pluginToolPath,
                bundleClassName: app.pluginBundleClass,
                callMethod:'cancel',
                arguments:[]
            };
            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.window.execTask(paramStr));
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
                app.enableExportBtn(false);
            }
        }catch(e){
            if(app.debug) alert(e);
            else console.log(e);
            app.enableExportBtn(false);
        }
    },
    revealBtnClick:function(){
        var params = {filePath: app.exportFilePath};
        var paramStr = JSON.stringify(params);
        try {
            (typeof maccocojs) && (maccocojs.window.revealInFinder(paramStr));
        } catch (e) {
            console.error(e)
        }
    },

    enableExportBtn:function(enable){
        $('#btn-export').data('kendoButton').enable(enable);
        $('#btn-cancel').data('kendoButton').enable(!enable);
    },

    showErrorDlg:function(message){
        var errorDlg = $('#window-info');
        var stemplate = kendo.template($("#info-template").html());
        errorDlg.html(stemplate({error:message, support:app.supportInfo}));

        var w = 600, h = 300;
        if(!errorDlg.data("kendoWindow")){
            errorDlg.kendoWindow({
                width: w+"px",
                height: h+"px",
                modal: false,
                actions: ["Refresh","Minimize", "Close"],
                title:"Show Error Info",
                position: {
                    top: 100,
                    left: 100
                }
            });
        }
        errorDlg.data("kendoWindow").open();
    },

    _generateHTMLReport:function(htmlTitle, elementSelector){
        var htmlHead = "<!DOCTYPE html><html><head><meta http-equiv='Content-Type' content='text/html;charset=utf-8'><title>" + htmlTitle + "</title></head>";
        var cssData = "html { font-size: 12px; font-family: Lucida Grande, Geneva, Verdana, Arial; }" +
            ".app-box-shadow{ -moz-box-shadow:0px 0px 5px #333333;-webkit-box-shadow:0px 0px 5px #333333;box-shadow:0px 0px 5px #333333;overflow: auto;}" +
            "table.diff{" +
            "border-collapse:collapse;border:1px solid darkgray;white-space:pre-wrap}" +
            "table.diff tbody{font-family:Courier,monospace}" +
            "table.diff tbody th{font-family:verdana,arial,'Bitstream Vera Sans',helvetica,sans-serif;background:#EED;font-size:11px;font-weight:normal;border:1px solid #BBC;color:#886;padding:.3em .5em .1em 2em;text-align:right;vertical-align:top}" +
            "table.diff thead{border-bottom:1px solid #BBC;background:#efefef;font-family:Verdana}" +
            "table.diff thead th.texttitle{text-align:left}" +
            "table.diff tbody td{padding:0 .4em;padding-top:.4em;vertical-align:top}" +
            "table.diff .empty{background-color:#DDD}table.diff .replace{background-color:#FD8}" +
            "table.diff .delete{background-color:#E99}" +
            "table.diff .skip{background-color:#efefef;border:1px solid #AAA;border-right:1px solid #BBC}" +
            "table.diff .insert{background-color:#9E9}" +
            "table.diff th.author{text-align:right;border-top:1px solid #BBC;background:#efefef}";

       var htmlBodyCss = "<style type='text/css'>" + cssData + "</style>";
       var htmlBody = '<body><div id="compare-result" class="app-box-shadow">'+ $(elementSelector).html() + htmlBodyCss  +'</div></body>';
       var html = htmlHead + htmlBody;

       return html;
    },

    _findImportPathExistInDs:function(findPath){
        for(var i = 0; i < app.ds_importInfos.length; ++i){
            var info = app.ds_importInfos[i];
            if (info.filePath == findPath) return true;
        }

        return false;
    },

    handExecTaskUpdateCallback:function(info){
        if(info.type == "type_initcoresuccess") {

        }else if (info.type == "type_addimportqueue_success") {
            var queueID = info.queueInfo.id;
            app.ds_importQueue.push(info.queueInfo);
            app.sendQueueEvent(queueID, "import", "start");
        }else if (info.type == "type_addexportqueue_success"){
            var queueID = info.queueInfo.id;
            app.ds_exportQueue.push(info.queueInfo);
            app.sendQueueEvent(queueID, "export", "start");
        }else if(info.type == "type_importsuccess"){
            var infoList = info.infoList;
            for(var i = 0; i < infoList.length; ++i)
            {
                var filePath = infoList[i].filePath;
                var mediaInfo = infoList[i].mediaInfoJSONData;
                app.ds_importInfos.push({filePath:filePath, mediaInfo:mediaInfo});
            }
            app.updateImportFilesSelect(app.ds_importInfos);

            if (info.timestramp > app.timestramp){
                app.timestramp = info.timestramp;
                var workingTaskCount = info.workingTaskCount;
                var sumTaskCount = info.sumTaskCount;
                var percent = (sumTaskCount - workingTaskCount +1) * 100/sumTaskCount;
                app.updateProgress({progress:percent});
                if(percent >=100){
                    $('#btn-reveal').data('kendoButton').enable(false);
                    $('#btn-clear').data('kendoButton').enable(true);
                    app.enableExportBtn(true);
                }else{
                    $('#btn-cancel').data('kendoButton').enable(true);
                }
            }
        }else if(info.type == "type_exportstart"){
            app.enableExportBtn(false);
        }else if(info.type == "type_reportexportprogress"){
            app.updateProgress(info);
        }else if(info.type == "type_exportsuccess"){
            app.enableExportBtn(true);
            app.exportFilePath = info.csvdir;
            app.updateProgress({progress:100});
            $('#btn-reveal').data('kendoButton').enable(true);
        }else if(info.type == "type_canceledexport"){
            app.enableExportBtn(true);
            app.updateProgress({progress:0});
        }else if(info.type == "type_error_import"){
            app.showErrorDlg(info.error);
            app.updateProgress({progress:0});
            $('#btn-reveal').data('kendoButton').enable(false);
        }else if(info.type == "type_error_export"){
            app.enableExportBtn(true);
            app.showErrorDlg(info.error);
            app.updateProgress({progress:0});
            $('#btn-reveal').data('kendoButton').enable(false);
        }
    },
    handImportFilesCallback:function(info){
        if(info.success){
            //适合新版本
            if(typeof info.filesCount != "undefined"){
                var filePathsObjArray = info.filesArray;

                var importFilesPath = [];
                for(var i = 0; i < filePathsObjArray.length; ++i){
                    var fileObj = filePathsObjArray[i];
                    //检查是否在ds_importInfos已经存在
                    if (!app._findImportPathExistInDs(fileObj.filePath)){
                        importFilesPath.push(fileObj.filePath);
                    }
                }

                app.addImportFiles(importFilesPath);
            }else{
                app.importFilePath = info.filePath;
                app.importFileNameWithoutExtension = info.fileNameWithoutExtension;
                $('#input-file').attr('value', app.importFilePath);
                app.addImportFiles(app.importFilePath);
            }

        }
    },
    
   handDragDropCallback:function(info){
        var fileArray = info.filesArray;

				var importFilesPath = [];
        $.each(fileArray, function(i,item){
            item.filePath;
            //检查是否在ds_importInfos已经存在
            if (!app._findImportPathExistInDs(item.filePath)){
                importFilesPath.push(item.filePath);
            }             
             
        });
        
        if(importFilesPath.length > 0) app.addImportFiles(importFilesPath);
        
        
    },
    

    handExportFilesCallback:function(info){
        if(info.success){
            app.exportFilePath = info.filePath;

            app["handSaveReportCallbackFunc"] = function(info){
                if(info.success){
                    $('#btn-reveal').data('kendoButton').enable(true);
                }else{
                    try{
                        var params = {
                            "path":app.exportFilePath
                        };
                        var paramStr = JSON.stringify(params);
                        (typeof maccocojs) && (maccocojs.window.removeFile(paramStr));
                    }catch(e){console.log(e)}
                }
            };

            var dateInfo = (new Date()).Format("yyyy-MM-dd hh:mm:ss");
            var reportTitle = "MediaInfo Diff Report - " + dateInfo;
            var htmlText = app._generateHTMLReport(reportTitle, "#compare-result");

            var params = {
                callback: 'app.handSaveReportCallbackFunc',
                filePath: app.exportFilePath,
                text:htmlText
            };

            var paramStr = JSON.stringify(params);
            try {
                (typeof maccocojs != "undefined") && (maccocojs.binaryFileWriter.writeTextToFile(paramStr));
            } catch (e) {
                if(app.debug) alert(e);
                else console.error(e);
            }
        }
    }
    
    
};


