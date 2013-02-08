//var gTestValue = 0;

//console.log('Keith: 1 window.requestFileSystem=' + window.requestFileSystem);
//window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
//console.log('Keith: 2 window.requestFileSystem=' + window.requestFileSystem);
var appDirectoryEntry = null
var xmlHttpResponseText = null;
var synccodelist = [];
var indexOfCodeList = 0;

function errorHandler(e) {
  var msg = '';
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    case FileError.SYNTAX_ERR:
      msg = 'SYNTAX_ERR';
      break;
    default:
      msg = 'Unknown Error:'+e.code;
      break;
  };
  console.log('Keith: initFS: Error:' + msg);
}

function errorHandlerDir(e) {
  console.log('Keith: errorHandlerDir ...e='+e); 
}

function syncCodes(){
    console.log('Keith: syncCodes: window.requestFileSystem=' +  window.requestFileSystem);
    if (window.requestFileSystem) {        
        initFS();
    }
}


function initFS() {
    console.log('Keith: initFS ...');
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, errorHandler);
}

function gotFS(filesystem) {
    console.log('Keith: getFS... filesystem='+filesystem);
    console.log('Keith:          filesystem.root.fullPath='+filesystem.root.fullPath);
    var appName = hellogap.getAppName();
    filesystem.root.getDirectory(appName, {create: true, exclusive: false}, gotAppDir, errorHandlerDir);    
}

function gotAppDir(parent){
    console.log('Keith: gotAppDir ...parent='+parent.name); 
    appDirectoryEntry = parent;
    downloadCodes();
}

function downloadCodes(){
    console.log('Keith: downloadCodes ...');
    
    BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;



    synccodelist[0] = { 
                        'dir': [],
                        'indexOfDir': 0,
                        'filename': 'app.manifest',
                        'url': 'https://html5demogootask.appspot.com/static/app.manifest',                        
                      };
    synccodelist[1] = { 
                        'dir': [],
                        'indexOfDir': 0,
                        'filename': 'index.html',
                        'url': 'https://html5demogootask.appspot.com/static/index.html',                        
                      };
    synccodelist[2] = { 
                        'dir': [],
                        'indexOfDir': 0,
                        'filename': 'mystyles.css',
                        'url': 'https://html5demogootask.appspot.com/static/mystyles.css'
                      };
    synccodelist[3] = { 
                        'dir': [],
                        'indexOfDir': 0,
                        'filename': 'json-minified.js',
                        'url': 'https://html5demogootask.appspot.com/static/json-minified.js'
                      };
    synccodelist[4] = { 
                        'dir': [],
                        'indexOfDir': 0,
                        'filename': 'phonegap-1.0.0.js',
                        'url': 'https://html5demogootask.appspot.com/static/phonegap-1.0.0.js'
                      };
    synccodelist[5] = { 
                        'dir': ['app'],
                        'indexOfDir': 0,
                        'filename': 'app_offline.js',
                        'url': 'https://html5demogootask.appspot.com/static/app/app_offline.js'
                      };

    synccodelist[6] = { 
                        'dir': ['touch'],
                        'indexOfDir': 0,
                        'filename': 'sencha-touch.js',
                        'url': 'https://html5demogootask.appspot.com/static/touch/sencha-touch.js'
                      };
    synccodelist[7] = { 
                        'dir': ['touch', 'resources', 'css'],
                        'indexOfDir': 0,
                        'filename': 'android.css',
                        'url': 'https://html5demogootask.appspot.com/static/touch/resources/css/android.css'
                      };

    indexOfCodeList = 0;
    requestDownloadSourceFiles();
}

function requestDownloadSourceFiles(){
    console.log('Keith: requestDownloadSourceFiles: ['+indexOfCodeList+']url='+synccodelist[indexOfCodeList].url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', synccodelist[indexOfCodeList].url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                xmlHttpResponseText = xhr.responseText;
                var item = synccodelist[indexOfCodeList];
                console.log('Keith: downloadCodes: success: url='+item.url);
                if(item.dir.length == 0) {
                    appDirectoryEntry.getFile(item.filename, {create: true}, gotFileEntry, errorHandler);                    
                } else {
                    item.indexOfDir = 0;
                    appDirectoryEntry.getDirectory(item.dir[item.indexOfDir], {create: true, exclusive: false}, gotDir, errorHandlerDir);
                }                
            } else {
                console.log('Keith: downloadCodes: Request failure. errorcode='+ xhr.status + 'url='+synccodelist[indexOfCodeList].url);
            }
        }
    };

    /*
    xhr.onload = function(e) {
      if (this.status == 200) {
        console.log('Keith: downloadCodes: success: onload ...this='+this);   
        
        //var bb = new BlobBuilder();
        //console.log('Keith: downloadCodes: success: onload ...BlobBuilder='+bb);      
        //bb.append(this.response); // Note: not xhr.responseText
        //var blob = bb.getBlob('image/png');
        //console.log('Keith: downloadCodes: success: onload ...blob='+blob);

        //var uInt8Array = new Uint8Array(this.response);
        console.log('Keith: downloadCodes: success: onload ...this.response='+this.response);
      }
    };*/

    xhr.send(null);
}

function gotFileEntry(fileEntry) {
    console.log('Keith: gotFileEntry ...'); 
    fileEntry.createWriter(gotFileWriter, errorHandler);
}

function gotFileWriter(writer) {
    console.log('Keith: gotFileWriter ...'); 

    writer.onwrite = function(evt) {
        console.log("Keith: gotFileWriter ... write success");      
        if( (indexOfCodeList + 1) < synccodelist.length ){
            indexOfCodeList = indexOfCodeList + 1;
            requestDownloadSourceFiles();
        }
    };

    writer.write(xmlHttpResponseText);
    
    //writer.write("some sample text");
    // contents of file now 'some sample text'
    //writer.truncate(11);
    // contents of file now 'some sample'
    //writer.seek(4);
    // contents of file still 'some sample' but file pointer is after the 'e' in 'some'
    //writer.write(" different text");
    // contents of file now 'some different text'    
}

function gotDir(parent){
    console.log('Keith: gotDir ...parent='+parent.name); 
    var item = synccodelist[indexOfCodeList];
    if( (item.indexOfDir + 1) < item.dir.length ){
        item.indexOfDir = item.indexOfDir + 1;
        parent.getDirectory(item.dir[item.indexOfDir], {create: true, exclusive: false}, gotDir, errorHandlerDir);
    } else {
        parent.getFile(item.filename, {create: true}, gotFileEntry, errorHandler);
    }
}


function detectWebWorker() {
  console.log('Keith: detect_web_worker: window.Worker='+window.Worker);
  return !!window.Worker;
}

function jsmainapp(){
    console.log('Keith: jsmainapp ...');
    var i = 0;    
    //gTestValue = 1;
    for(i=0;i<15000;i++){
        console.log('Keith: jsmainapp ... '+i);
    }
    console.log('Keith: jsmainapp ...done');
}



function onReceiveToken(){
    
    console.log('Keith: onReceiveToken: ...');
    
    //var i = 0;    
    //gTestValue = 1;
    //for(i=0;i<15000;i++){
    //    console.log('Keith: onReceiveToken: ...gTestValue='+gTestValue);
    //}

    var token = hellogap.getToken();
    console.log('Keith: onReceiveToken: token='+token);
    if(token != null && token != undefined){
        gTask.accessToken = token;
        syncDataBase(true);
    } else {
        hellogap.showNoConnection();
        showListsPanel();       
    }
}



function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    console.log('Keith: Connection type:' + states[networkState]);

    if(networkState == Connection.NONE){
        return false;
    } else {
        return true;
    }
}

function clearSpan(text){
    //var test = '<span class="wordcolor">1</span>2<span class="wordcolor">3</span><span class="wordcolor">4</span>56<span class="wordcolor">7</span>';
    //console.log('Keith: clearSpan 1 text=' + text);
    var regex1=/<span class="wordcolor">/gi;
    var regex2=/<\/span>/gi;
    var text1 = text.replace(regex1,'');
    var text2 = text1.replace(regex2,'');
    //console.log('Keith: clearSpan 2 text2=' + text2);
    return text2;
}


function getTitleFromInnerHTML(str){        
    var from = str.indexOf('<p><b>') + 6;
    var to =  str.indexOf('</b></p>');
    //var len = end - start;
    var title = str.substring(from, to);
    //console.log('Keith: getTitleFromInnerHTML title= ' + title);  
    //console.log('Keith: getTitleFromInnerHTML start= ' + from);  
    //console.log('Keith: getTitleFromInnerHTML end= ' + to);  
    return title;
}

function getPosTitleFromInnerHTML(str){ 
    var pos = str.indexOf('<p><b>');
    if(pos == -1) {
        return -1;
    } else {
        return pos + 6;
    }
}


function getNoteFromInnerHTML(str){        
    var from = str.indexOf('<small>') + 7;
    var to =  str.indexOf('</small>');
    //var len = end - start;
    var note = str.substring(from, to);
    //console.log('Keith: getTitleFromInnerHTML note= ' + note);  
    //console.log('Keith: getTitleFromInnerHTML start= ' + from);  
    //console.log('Keith: getTitleFromInnerHTML end= ' + to);  
    return note;
}

function getPosNoteFromInnerHTML(str){ 
    var pos = str.indexOf('<small>');
    if(pos == -1) {
        return -1;
    } else {
        return pos + 7;
    }
}

function getDueFromInnerHTML(str){        
    var from = str.indexOf('<i>') + 3;
    var to =  str.indexOf('</i>');
    var due = str.substring(from, to);
    //console.log('Keith: getTitleFromInnerHTML due= ' + due);  
    //console.log('Keith: getTitleFromInnerHTML start= ' + from);  
    //console.log('Keith: getTitleFromInnerHTML end= ' + to);  
    return due;
}

function getPosDueFromInnerHTML(str){ 
    var pos = str.indexOf('<i>');
    if(pos == -1) {
        return -1;
    } else {
        return pos + 3;
    }
}


function SearchKeywordinTasks(keywords){
//nodes[0]=  <div class="x-list-item-body">
//               <div class="tasksflexbox">
//                     <div class="listLeftNode"><p> </p></div>
//                     <div class="space"><p> </p></div>
//                     <div class="needsactioncheckbox"><p> </p></div>
//                     <div class="space"><p> </p></div>
//                     <div class="needsactiontext"><p><b>test</b></p><p><small>Node</small></p></div>
//                     <div class="dueday"><p><small><i></i></small></p></div>
//               </div>
//           </div>


    var nodes = gTask.tasksList.getNodes();
    for(var x=0;x<nodes.length;x++){
        var node = nodes[x];
        //console.log('Keith: SearchKeywordinTasks:  nodes['+x+']='+node.innerHTML);
        //console.log('Keith: SearchKeywordinTasks:     innerText='+node.innerText);
        node.innerHTML = clearSpan(node.innerHTML);
        var title = getTitleFromInnerHTML(node.innerHTML);
        var note  = getNoteFromInnerHTML(node.innerHTML);
        var due   = getDueFromInnerHTML(node.innerHTML);

        var posTitle = getPosTitleFromInnerHTML(node.innerHTML);
        var posNote  = getPosNoteFromInnerHTML(node.innerHTML);
        var posDue   = getPosDueFromInnerHTML(node.innerHTML);

        var posOffsetTitle = title.indexOf(keywords);
        var posOffsetNote  = note.indexOf(keywords);
        var posOffsetDue   = due.indexOf(keywords);
        var posHitTitle = posTitle + posOffsetTitle;
        var posHitNote  = posNote  + posOffsetNote;
        var posHitDue   = posDue   + posOffsetDue;
        
        //console.log('Keith:                         posTitle ='+posTitle);
        //console.log('Keith:                         posNote  ='+posNote);
        //console.log('Keith:                         posDue   ='+posDue);
        //console.log('Keith:                         posOffsetTitle='+posOffsetTitle);
        //console.log('Keith:                         posOffsetNote ='+posOffsetNote);
        //console.log('Keith:                         posOffsetDue  ='+posOffsetDue);

        if(keywords.length == 0){
            node.style.display="block";

        } else if(posOffsetTitle == -1 && posOffsetNote == -1 && posOffsetDue == -1){
            node.style.display="none";

        } else {
            if(posOffsetDue != -1){
                node.style.display="block";
                var oldHTML = node.innerHTML;
                var newHTML = oldHTML.substring(0, posHitDue) + '<span class="wordcolor">' +
                oldHTML.substring(posHitDue, posHitDue+keywords.length) + '</span>' +
                oldHTML.substring(posHitDue+keywords.length);
                console.log('Keith:              newHTML='+newHTML);
                node.innerHTML = newHTML;
            }

            if(posOffsetNote != -1){
                node.style.display="block";
                var oldHTML = node.innerHTML;
                var newHTML = oldHTML.substring(0, posHitNote) + '<span class="wordcolor">' +
                oldHTML.substring(posHitNote, posHitNote+keywords.length) + '</span>' +
                oldHTML.substring(posHitNote+keywords.length);
                console.log('Keith:              newHTML='+newHTML);
                node.innerHTML = newHTML;
            }

            if(posOffsetTitle != -1){
                node.style.display="block";
                var oldHTML = node.innerHTML;
                var newHTML = oldHTML.substring(0, posHitTitle) + '<span class="wordcolor">' +
                oldHTML.substring(posHitTitle, posHitTitle+keywords.length) + '</span>' +
                oldHTML.substring(posHitTitle+keywords.length);
                console.log('Keith:              newHTML='+newHTML);
                node.innerHTML = newHTML;
            }
        }
    }
}


function SearchKeywordinLists(keywords){
    var nodes = gTask.listsList.getNodes();
    for(var x=0;x<nodes.length;x++){
        var node = nodes[x];
        //console.log('Keith: SearchKeywordinLists:  nodes['+x+']='+node.innerHTML);
        //console.log('Keith: SearchKeywordinLists:     innerText='+node.innerText);
        node.innerHTML = clearSpan(node.innerHTML);

        var title = getTitleFromInnerHTML(node.innerHTML);
        var posTitle = getPosTitleFromInnerHTML(node.innerHTML);
        var posOffsetTitle = title.indexOf(keywords);
        var posHitTitle = posTitle + posOffsetTitle;


        //console.log('Keith:                         pos_start='+pos_start);
        //console.log('Keith:                         pos_offset='+pos);
        if(keywords.length == 0){
            //node.style.visibility="visible";
            node.style.display="block";

        } else if(posOffsetTitle == -1){
            //node.style.visibility="hidden";
            node.style.display="none";

        } else {
            //node.style.visibility="visible";
            node.style.display="block";

            //<div class="x-list-item-body">Default List</div>
            if(posOffsetTitle != -1){
                node.style.display="block";
                var oldHTML = node.innerHTML;
                var newHTML = oldHTML.substring(0, posHitTitle) + '<span class="wordcolor">' +
                oldHTML.substring(posHitTitle, posHitTitle+keywords.length) + '</span>' +
                oldHTML.substring(posHitTitle+keywords.length);
                console.log('Keith:              newHTML='+newHTML);
                node.innerHTML = newHTML;
            }
        }
    }
}

function keywordSearch(text, event){
    var keywords = text.getValue();
    console.log('Keith: keywordSearch:  keywords='+keywords);
    var cardid = gTask.cards.getActiveItem().id;

    if(cardid == 'listsPanel'){
        SearchKeywordinLists(keywords);    
                                                  
    } else if(cardid == 'tasksPanel') {
        SearchKeywordinTasks(keywords); 
      
    }    
}

function showListsSearchItem(){
    gTask.listsList.myIsSearch = true;
    var comp = gTask.listsToolbar.getComponent( 'searchItem' );
    if(comp == undefined){
        gTask.listsToolbar.add( gTask.searchItem );   
        comp = gTask.listsToolbar.getComponent( 'searchItem' ); 
    }

    comp.reset();
    comp.show();
    gTask.listsToolbar.doComponentLayout();
    comp.focus();
    hellogap.showKeyBoard();
    comp.focus();
}

function hideListsSearchItem(){
    gTask.listsList.myIsSearch = false;
    hellogap.hideKeyBoard();
    var comp = gTask.listsToolbar.getComponent( 'searchItem' );
    if(comp != undefined){
        comp.hide();
        gTask.listsToolbar.doComponentLayout();
    }
    //var autoDestroy = true;
    //var pos = 0;
    //var component = gTask.listsPanel.getDockedComponent(pos);           
    //gTask.listsPanel.removeDocked(component, autoDestroy);
}


function showTasksSearchItem(){
    gTask.tasksList.myIsSearch = true;
    var comp = gTask.tasksToolbar.getComponent( 'searchItem' );
    //var compBack = gTask.tasksToolbar.getComponent( 'MyListsBack' );
    if(comp == undefined){
        gTask.tasksToolbar.add( gTask.searchItem );   
        comp = gTask.tasksToolbar.getComponent( 'searchItem' ); 
    }
    //compBack.hide();
    comp.reset();
    comp.show();    
    gTask.tasksToolbar.doComponentLayout();
    comp.focus();
    hellogap.showKeyBoard();
    comp.focus();
}

function hideTasksSearchItem(){
    gTask.tasksList.myIsSearch = false;
    hellogap.hideKeyBoard();
    var comp = gTask.tasksToolbar.getComponent( 'searchItem' );
    if(comp != undefined){
        comp.hide();
        gTask.tasksToolbar.doComponentLayout();
    }
    //var compBack = gTask.tasksToolbar.getComponent( 'MyListsBack' );
    //compBack.show();
}


function month2int(month) {
    var monthInt = '01';
    switch (month) {
        case "Jan":
            monthInt = '01';
            break;
        case "Feb":
            monthInt = '02';
            break;
        case "Mar":
            monthInt = '03';
            break;
        case "Apr":
            monthInt = '04';
            break;
        case "May":
            monthInt = '05';
            break;
        case "Jun":
            monthInt = '06';
            break;
        case "Jul":
            monthInt = '07';
            break;
        case "Aug":
            monthInt = '08';
            break;
        case "Sep":
            monthInt = '09';
            break;
        case "Oct":
            monthInt = '10';
            break;
        case "Nov":
            monthInt = '11';
            break;
        case "Dec":
            monthInt = '12';
            break;
    }
    return monthInt;
}


function getNumOfDoneTasks(listId){
    //console.log('Keith: getNumOfTasks ...listId='+listId);  
    
    var db = null;
    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].list.id == listId){
            db = gTask.localDataBase[i];
            break;
        }
    }    
    
    if(db == null){
        console.log('Keith: getNumOfTasks ... db=null');
        return -1;
    }

    if(db.tasks == null){
        console.log('Keith: getNumOfTasks ... db.tasks=null');
        return 0;
    }

    if(db.tasks.length == 0){
        //console.log('Keith: getNumOfTasks ... length=0');
        return 0;

    } else {
        //console.log('Keith: getNumOfTasks ... db.tasks.length='+db.tasks.length);
        //var tasks = [];
        var j=0;
        for(var i=0;i<db.tasks.length;i++){
            //console.log('Keith: ['+i+']->exStatus='+db.tasks[i].exStatus);
            if(db.tasks[i].exStatus != 'delete'){
                if(db.tasks[i].status == 'completed'){
                    j = j + 1;
                }
            }
        }
        return j;
    }
}



function getNumOfTasks(listId){
    //console.log('Keith: getNumOfTasks ...listId='+listId);  
    
    var db = null;
    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].list.id == listId){
            db = gTask.localDataBase[i];
            break;
        }
    }    
    
    if(db == null){
        console.log('Keith: getNumOfTasks ... db=null');
        return -1;
    }

    if(db.tasks == null){
        console.log('Keith: getNumOfTasks ... db.tasks=null');
        return 0;
    }

    if(db.tasks.length == 0){
        //console.log('Keith: getNumOfTasks ... length=0');
        return 0;

    } else {
        //console.log('Keith: getNumOfTasks ... db.tasks.length='+db.tasks.length);
        //var tasks = [];
        var j=0;
        for(var i=0;i<db.tasks.length;i++){
            //console.log('Keith: ['+i+']->exStatus='+db.tasks[i].exStatus);
            if(db.tasks[i].exStatus != 'delete'){
                j = j + 1;
            }
        }
        return j;        
    }
}


function changeTaskStatus(listid, taskid){
    console.log('Keith: changeTaskStatus ...');  

    var tasks = gTask.refCurrentTasksDB;
    var task = null;

    for(var i=0;i<tasks.length;i++){
        if(tasks[i].id==taskid){
            task = tasks[i];
            break;
        }
    }

    if(task==null){
        console.log('Keith: changeTaskStatus: Fail, task=null');
        return;
    }


    if(task.status == 'needsAction'){
        task.status = 'completed'; 
    } else {
        task.status = 'needsAction'; 
        task.completed = null;
    }

    console.log('Keith: changeTaskStatus ... title='+task.title); 

    saveDBtoNative();
}

function addTask(mtitle, mstatus, mdue, mnotes){
    console.log('Keith: addTask ... title='+mtitle);

    var tasks = gTask.refCurrentTasksDB;
    var time = new Date().getTime();
    var id = 'HTC#'+time;
    var task = {};

    task.id = id;
    task.title = mtitle;
    task.notes = mnotes;    
    if(mdue.length != 0){
        task.due = mdue;
    }
    if(mstatus.isChecked()){
        task.status = 'completed'; 
    } else {
        task.status = 'needsAction'; 
        task.completed = null;
    }
    task.exStatus = 'add';//add, delete, modify, sync
    
    tasks[tasks.length] = task;
    
    saveDBtoNative();
}


function setTask(mtitle, mstatus, mdue, mnotes){
    console.log('Keith: setTask ... title='+mtitle);
    var tasks = gTask.refCurrentTasksDB;
    var taskID = gTask.currentTaskID;
    var task = null;
    for(var i=0;i<tasks.length;i++){
        if(tasks[i].id==taskID){
            task = tasks[i];
            break;
        }
    }

    if(task==null){
        console.log('Keith: setTask: Fail, task=null');
        return;
    }

    task.title = mtitle;
    task.notes = mnotes;
    
    if(mdue.length != 0){
        task.due = mdue;
    }

    if(mstatus.isChecked()){
        task.status = 'completed'; 
    } else {
        task.status = 'needsAction'; 
        task.completed = null;
    }

    if(task.exStatus == 'add') {
        ;//keep 'add' for http request "set"
    } else {
        task.exStatus = 'modify';//add, delete, modify, sync
    }

    saveDBtoNative();
}


function deleteTask(taskID){
    console.log('Keith: deleteTask ...');

    var tasks = gTask.refCurrentTasksDB;
    var index = -1;
    for(var i=0;i<tasks.length;i++){
        if(tasks[i].id==taskID){
            index = i;
            break;
        }
    }

    if(index==-1){
        console.log('Keith: deleteTask: Fail, not found taskID='+taskID);
        return;
    }

    console.log('Keith: deleteTask ...title='+tasks[index].title);

    if(tasks[index].id.substring(0,4) == 'HTC#'){
        console.log('Keith: deleteTask: '+tasks[index].id);
        //tasks[index].exStatus = 'delete';//add, delete, modify, sync
        tasks.splice(index,1);        
    } else {
        tasks[index].exStatus = 'delete';//add, delete, modify, sync
    }

    saveDBtoNative();
}

function addList(title){
    console.log('Keith: addList ... title='+title);

    var i = gTask.localDataBase.length;
    var time = new Date().getTime();
    var id = 'HTC#'+time;
    var list = {};
    list.id = id;
    list.title = title;
    list.exStatus = 'add';//add, delete, modify, sync
    gTask.localDataBase[i] = {'list': list, 'tasks': [], 'updated': true };

    //keithtest1000 -- start
    var pos = title.indexOf('testadd');
    if(pos != -1){
        var addnum = title.substring(pos+7);
        console.log('Keith: addList : testadd num='+addnum);
        keithtest1000(gTask.localDataBase[i],addnum);
    }
    //keithtest1000 -- end

    saveDBtoNative();
}

function deleteList(id){
    console.log('Keith: deleteList ... id='+id);

    if(gTask.defaultListID == id){
        console.log('Keith: deleteList Cannot delete default list');
        return;
    }

    var index = -1;

    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].list.id == id){
            index = i;
            break;
        }
    }

    if(index==-1){
        console.log('Keith: deleteList: Fail, not found id='+id);
        return;
    }

    console.log('Keith: deleteList ...title='+gTask.localDataBase[index].list.title);

    if(gTask.localDataBase[index].list.id.substring(0,4) == 'HTC#'){
        console.log('Keith: deleteList: '+gTask.localDataBase[index].list.id);
        //gTask.localDataBase[index].list.exStatus = 'delete';//add, delete, modify, sync
        gTask.localDataBase.splice(index,1);    
    } else {
        gTask.localDataBase[index].list.exStatus = 'delete';//add, delete, modify, sync
    }
    
    saveDBtoNative();

}



function showTasksPanel(listId){
    console.log('Keith: showTasksPanel ...listId='+listId);

    gTask.refCurrentTasksDB = null;
    
    var db = null;
    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].list.id == listId){
            db = gTask.localDataBase[i];
            break;
        }
    }    
    
    if(db == null){
        console.log('Keith: showTasksPanel ... db=null');
        gTask.tasksList.hide();
        return;
    }

    if(db.tasks == null){
        console.log('Keith: showTasksPanel ... db.tasks=null');
        gTask.tasksList.hide();
        return;
    }

    gTask.refCurrentTasksDB = db.tasks;

    if(db.tasks.length == 0){
        console.log('Keith: showTasksPanel ... length=0');
        gTask.tasksList.hide();
    } else {
        console.log('Keith: showTasksPanel ... db.tasks.length='+db.tasks.length);
        var tasks = [];
        var j=0;
        for(var i=0;i<db.tasks.length;i++){
            //console.log('Keith: ['+i+']->exStatus='+db.tasks[i].exStatus);
            if(db.tasks[i].exStatus != 'delete'){
                tasks[j] = db.tasks[i];
                j = j + 1;
            }
        }
        gTask.storeTasks = new Ext.data.JsonStore({
            model  : 'Tasks',
            sorters: 'title',
            getGroupString : function(record) {
                return record.get('title')[0];
            },
            data: [tasks]
        });
        gTask.tasksList.bindStore(gTask.storeTasks);
        //gTask.tasksList.refresh();
        gTask.tasksList.show();
    }

    if( gTask.tasksList.myIsSearch == true ){
        var comp = gTask.tasksToolbar.getComponent( 'searchItem' );
        var keywords = comp.getValue();
        SearchKeywordinTasks(keywords);
        return; 
    }
  
}

function showListsPanel(){
    console.log('Keith: showListsPanel ... length='+gTask.localDataBase.length);
    var lists = [];
    var j=0;
    for(var i=0;i<gTask.localDataBase.length;i++){
        console.log('Keith: ['+i+'] -> '+gTask.localDataBase[i].list.title+' -> '+gTask.localDataBase[i].list.exStatus);
        if(gTask.localDataBase[i].list.exStatus != 'delete'){
            lists[j] = gTask.localDataBase[i].list;
            j = j + 1;
        }
    }
    gTask.storeLists.loadData(lists);
    gTask.listsList.bindStore(gTask.storeLists);
    gTask.cards.setLoading(false);

    if( gTask.listsList.myIsSearch == true ){
        var comp = gTask.listsToolbar.getComponent( 'searchItem' );
        var keywords = comp.getValue();
        SearchKeywordinLists(keywords);
        return; 
    }

}

function syncFinsihed(){
    console.log('Keith: syncFinsihed ...');
    for(var i=0;i<gTask.localDataBase.length;i++){
        console.log('Keith: list['+i+']='+ gTask.localDataBase[i].list.title);
        for(var j=0;j<gTask.localDataBase[i].tasks.length;j++){
            console.log('Keith: tasks['+j+']='+ gTask.localDataBase[i].tasks[j].title);
            console.log('Keith: tasks['+j+'].exStatus='+ gTask.localDataBase[i].tasks[j].exStatus);            
        }
    }
    console.log('Keith: syncFinsihed ... done.');

    saveDBtoNative();

    showListsPanel();
}

function markAcquiredTasks(db){
    console.log('Keith: markAcquiredTasks ... list='+db.list.title);
    db.updated = true;
    var numFinished = 0;
    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].updated){
            numFinished = numFinished + 1;
        }
    }
    if(numFinished == gTask.localDataBase.length){
        syncFinsihed();
    }
}


function keithtest1000(db,addnum){
    console.log('Keith: keithtest1000 ... list='+db.list.title);
    var time = new Date().getTime();
    var id = 'HTC#'+time;
    for(var i=0;i<addnum;i++){        
        db.tasks[i] = { 
                        'id': id + i,
                        'title': 'title' + i,
                        'notes': 'note' + i,
                        'due': null,
                        'status': 'needsAction',
                        'exStatus' : 'add'
                      };
        //console.log('Keith: keithtest1000 ... db.tasks['+i+']='+db.tasks[i].title);
    }
}


function getTasks(db){
    console.log('Keith: getTasks ... list='+db.list.title);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var tasks = JSON.parse(xhr.responseText);
                console.log('Keith: getTasks: success: list='+db.list.title);
                if(tasks.items == undefined){
                    db.tasks = [];
                } else {
                    db.tasks = tasks.items;     
                }               
                for(var i=0;i<db.tasks.length;i++){
                    db.tasks[i].exStatus= 'sync';//add, delete, modify, sync
                }
            } else {
                console.log('Keith: getTasks: Request failure. errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }    
            }
            markAcquiredTasks(db);
        }
    };
    xhr.open('GET', gTask.apiVersion+'/lists/'+db.list.id+'/tasks?pp=1&key='+gTask.key, true);
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
    xhr.send(null);    
}


function getLists(){
    console.log('Keith: getLists ...');

    var xhr = new XMLHttpRequest();    
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                console.log('Keith: getLists: success');
                var lists = JSON.parse(xhr.responseText);
                gTask.localDataBase = [];
                for(var i=0;i<lists.items.length;i++){
                    console.log('Keith: getLists: lists.title=' + lists.items[i].title);
                    lists.items[i].exStatus = 'sync';//add, delete, modify, sync
                    gTask.localDataBase[i] = {'list': lists.items[i], 'tasks': [], 'updated': false};
                    if(i==0){
                        gTask.defaultListID = lists.items[i].id;
                    }
                    getTasks(gTask.localDataBase[i]);
                }
            } else {
                console.log('Keith: getLists: Request failure: errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }
            }
        }
    };
    xhr.open('GET', gTask.apiVersion+'/users/@me/lists'+'?pp=1&key='+gTask.key, true);
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
    xhr.send(null);
}


function setTasksFinsihed(){
    console.log('Keith: setTasksFinsihed !');
    getLists();
}


function markSetTask(task){
    console.log('Keith: markSetTask ... task='+task.title);

    task.exStatus = 'sync';
    
    var isFinished = true;

    for(var i=0;i<gTask.localDataBase.length;i++){
        var list = gTask.localDataBase[i].list;
        var tasks = gTask.localDataBase[i].tasks;

        if(list.exStatus != 'delete'){
            for(var j=0;j<tasks.length;j++){
                if(tasks[j].exStatus != 'sync'){
                    isFinished = false;
                    console.log('Keith: markSetTask ... tasks['+j+']='+tasks[j].exStatus);
                    var task = tasks[j];
                    switch (task.exStatus) {
                        case 'delete':
                            isSentRequest = true;
                            requestDeleteTask(list,task);
                            break;

                        case 'add':
                            isSentRequest = true;
                            requestAddTask(list,task);
                            break;            

                        case 'modify':
                            isSentRequest = true;
                            requestUpdateTask(list,task);
                            break;

                        case 'sync':
                            break;

                        default:
                            console.log('Keith: unknown exStatus='+exStatus);                          
                    }
                    break;
                }
            }          
        }

        if(isFinished == false){
            break;
        }  
    }
        
    if(isFinished == true){
        setTasksFinsihed();
    }
}

function setTasks(){
    console.log('Keith: setTasks ... length=' + gTask.localDataBase.length);
    var isSentRequest = false;

    for(var i=0;i<gTask.localDataBase.length;i++){
        var list = gTask.localDataBase[i].list;
        var tasks = gTask.localDataBase[i].tasks;
        console.log('Keith: setTasks ...list='+list.title);

        if(list.exStatus != 'delete'){
            //for(var j=0;j<tasks.length;j++){
            if(tasks.length>=1){
                var task = tasks[0];
                console.log('Keith: setTasks ...task='+task.title);
                switch (task.exStatus) {
                    case 'delete':
                        isSentRequest = true;
                        requestDeleteTask(list,task);
                        break;

                    case 'add':
                        isSentRequest = true;
                        requestAddTask(list,task);
                        break;            

                    case 'modify':
                        isSentRequest = true;
                        requestUpdateTask(list,task);
                        break;

                    case 'sync':
                        break;

                    default:
                        console.log('Keith: unknown exStatus='+exStatus);                          
                }
            }
        } 
    }

    if(isSentRequest == false){
        setTasksFinsihed();
    }

}


function setListsFinsihed(){
    console.log('Keith: setListsFinsihed !');
    setTasks();
}


function markSetList(list){
    console.log('Keith: markSetList ... list='+list.title);
    
    list.exStatus = 'sync';

    var numFinished = 0;
    for(var i=0;i<gTask.localDataBase.length;i++){
        if(gTask.localDataBase[i].list.exStatus == 'sync'){
            numFinished = numFinished + 1;
        }
    }
    if(numFinished == gTask.localDataBase.length){
        setListsFinsihed();
    }
}


function setLists(){
    console.log('Keith: setLists ...');
    var isSentRequest = false;

    for(var i=0;i<gTask.localDataBase.length;i++){
        var list = gTask.localDataBase[i].list;
        switch (list.exStatus) {
            case 'delete':
                isSentRequest = true;
                requestDeleteList(list);
                break;

            case 'add':
                isSentRequest = true;
                requestAddList(list);
                break;            

            case 'modify':
                break;

            case 'sync':
                break;

            default:
                console.log('Keith: unknown exStatus='+exStatus);                          
        }
    }

    if(isSentRequest == false){
        setListsFinsihed();
    }
}


function syncDataBase(isShowDialog){
    console.log('Keith: syncDataBase ...');
       
    if(checkConnection() == false){
        if(isShowDialog == true){
            hellogap.showNoConnection();
        }
        showListsPanel();
        return;
    }

    setLists();
}

function saveDBtoNative(){
    console.log('Keith: saveDBtoNative ... ');

    //localStorage.clear();

    localStorage.ok = 'Local Storage Test';

    localStorage.setItem('localDataBase_'+gTask.accountName, JSON.stringify(gTask.localDataBase));

    console.log('Keith: saveDBtoNative ... done');
}

function readDBfromNative(){
    console.log('Keith: readDBfromNative ... ');

    localStorage.ok = 'Local Storage Test';
    console.log('Keith: readDBfromNative ... localStorage.ok ='+localStorage.ok);

    gTask.localDataBase = [];
   
    var retrievedObject = localStorage.getItem('localDataBase_'+gTask.accountName);    

    if(retrievedObject == undefined){
        console.log('Keith: readDBfromNative ... gTask.localDataBase_'+gTask.accountName+ ' is null');
    } else {
        gTask.localDataBase = JSON.parse(retrievedObject);    
    }

    for(var i=0;i<gTask.localDataBase.length;i++){
        var db = gTask.localDataBase[i];
        
        for(var a=0;a<gTask.itemsOfList.length;a++){
            var item = gTask.itemsOfList[a];
            console.log('Keith:          ['+i+'] list.'+item+' -> ' +db.list[item]);
        }

        var tasks = db.tasks;
        for(var a=0;a<tasks.length;a++){
            var task = tasks[a];

            for(var b=0;b<gTask.itemsOfTask.length;b++){
                var item = gTask.itemsOfTask[b];
                console.log('Keith:                  ['+a+'] task.'+item+' -> ' +task[item]);
            }
        }
    }

    console.log('Keith: readDBfromNative ... done');
}


function showUpdateTaskEditor(taskID){
    console.log('Keith: showUpdateTaskEditor ...');

    var task = null;
    var tasks = gTask.refCurrentTasksDB;   
    for(var i=0;i<tasks.length;i++){
        if(tasks[i].id == taskID){
            task = tasks[i];
            break;
        }
    }

    if(task == null){
        console.log('Keith: showUpdateTaskEditor ... Fail.');
        return;
    }

    Ext.getCmp('updateTaskEditor').enable();

    Ext.getCmp('uptaskTitle').setValue(task.title);

    Ext.getCmp('uptaskNotes').setValue(task.notes);
    
    var status = Ext.getCmp('uptaskStatus');
    if( task.status == "completed" ){
        console.log('Keith: showUpdateTaskEditor: status = completed');
        status.check();
    } else {
        console.log('Keith: showUpdateTaskEditor: status = needsAction');
        status.uncheck();
    }
 
    var due = Ext.getCmp('uptaskDue');
    
    console.log('Keith: showUpdateTaskEditor: task.due  = ' + task.due);
    if(task.due != ''){
        //Sat Jan 01 2011 00:00:00 GMT+0800 (CST)
        //"2011-08-11T00:00:00.000Z"
        //new Date('1/10/2007 03:05:01 PM GMT-0600');
        var year = task.due.substring(0,4);
        var mon = task.due.substring(5,7);
        var day = task.due.substring(8,10);
        console.log('Keith: showUpdateTaskEditor: year='+year+'mon='+mon+'day='+day);
        var senchaDue = new Date(mon+'/'+day+'/'+year); 
        console.log('Keith: showUpdateTaskEditor: senchaDue  = ' + senchaDue );
        due.setValue(senchaDue);
    }
    //gTask.updateTaskEditor.findById('uptaskTitle').focus();
    
    gTask.updateTaskEditor.show();
}


function requestAddList(list){
    // POST https://www.googleapis.com/tasks/v1/users/@me/lists?pp=1&key={YOUR_API_KEY}
    // Content-Type:  application/json
    // Authorization:  OAuth xxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    // X-JavaScript-User-Agent:  Google APIs Explorer google-api-gwt-client/0.1-alpha
    // {
    //  "title": "listName"
    // }

    var listName = list.title;
    console.log('Keith: requestAddList: listName='+listName);

    //gTask.cards.setLoading(true);//keithtest
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var reList = JSON.parse(xhr.responseText);
                console.log('Keith: requestAddList: success title='+reList.title);
                list.id = reList.id;
                markSetList(list);
            } else {
                console.log('Keith: requestAddList: Request failure. errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }  
            }
        }
    };

    xhr.open('POST', gTask.apiVersion+'/users/@me/lists?pp=1&key='+gTask.key, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
   
    var msg = JSON.stringify({
        title: listName
    });    

    xhr.send(msg);
}


function requestDeleteList(list){
    // DELETE https://www.googleapis.com/tasks/v1/users/@me/lists/34234?pp=1&key={YOUR_API_KEY}

    var listID = list.id;
    console.log('Keith: requestDeleteList: listID='+listID);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 204) {
                console.log('Keith: requestDeleteList: success');
                markSetList(list);
            } else {
                console.log('Keith: requestDeleteList: Request failure. errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }
            }
        }
    };

    xhr.open('DELETE', gTask.apiVersion+'/users/@me/lists/'+listID+'?pp=1&key='+gTask.key, true);
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
    xhr.send();
}




function requestAddTask(list,task){
    // POST https://www.googleapis.com/tasks/v1/lists/@default/tasks?pp=1&key={YOUR_API_KEY}
    // Content-Type:  application/json
    // Authorization:  OAuth xxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    // X-JavaScript-User-Agent:  Google APIs Explorer google-api-gwt-client/0.1-alpha
    // {
    //  "title": "my tets task",
    //  "status": "needsAction",  "completed"
    //  "due": "2011-08-11T00:00:00.000Z",
    //  "notes": "23434234"
    // }

    //gTask.cards.setLoading(true);//keithtest
    console.log('Keith: requestAddTask: title='+task.title);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var retask = JSON.parse(xhr.responseText);
                console.log('Keith: requestAddTask success');
                markSetTask(task);
            } else {
                console.log('Keith: requestAddTask: Request failure. errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }  
            }
        }
    };

    xhr.open('POST', gTask.apiVersion+'/lists/'+list.id+'/tasks?pp=1&key='+gTask.key, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
   
    var msgOri = {
        title: task.title,
        notes: task.notes,
        status: task.status,
    }
  
    if(task.due != undefined){
        if(task.due.length != 0){
            msgOri.due = task.due;
        }    
    }

    var msg = JSON.stringify(msgOri);
    xhr.send(msg);
}



function requestUpdateTask(list,task){
    // PATCH https://www.googleapis.com/tasks/v1/lists/@default/tasks/MDYwODY1NTkxMjM1ODk0OTQ0MTE6MDo1MA?pp=1&key={YOUR_API_KEY}
   
    console.log('Keith: requestUpdateTask: title='+task.title);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var retask = JSON.parse(xhr.responseText);
                console.log('Keith: requestUpdateTask: success.');
                markSetTask(task);
            } else {
                console.log('Keith: requestUpdateTask: Request failure. requestUpdateTask: '+xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                }            
            }
        }
    };

    if(list.id == gTask.defaultListID){
        xhr.open('PATCH', gTask.apiVersion+'/lists/@default/tasks/'+task.id+'?pp=1&key='+gTask.key, true);
    } else {
        xhr.open('PATCH', gTask.apiVersion+'/lists/'+list.id+'/tasks/'+task.id+'?pp=1&key='+gTask.key, true);
    }    
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);

    var msgOri = {
        title : task.title,
        notes : task.notes,
        status : task.status
    }

    if(task.status == 'needsAction'){
        msgOri.completed = null;          
    }
     
    if(task.due != undefined){ 
        if(task.due.length != 0){
            msgOri.due = task.due;
        }
    }

    var msg = JSON.stringify(msgOri);
    xhr.send(msg);
}


function requestDeleteTask(list,task){
    // DELETE https://www.googleapis.com/tasks/v1/lists/@default/tasks/123?pp=1&key={YOUR_API_KEY}

    console.log('Keith: requestDeleteTask: taskID='+task.id);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
            if(xhr.status == 204) {
                console.log('Keith: requestDeleteTask success');
                markSetTask(task);
            } else {
                console.log('Keith: Request failure : requestDeleteTask: errorcode='+ xhr.status);
                if(xhr.status == 401){
                    hellogap.requestToken();
                } 
            }
        }
    };

    if(list.id == gTask.defaultListID){
        xhr.open('DELETE', gTask.apiVersion+'/lists/@default/tasks/'+task.id+'?pp=1&key='+gTask.key, true);
    } else {   
        xhr.open('DELETE', gTask.apiVersion+'/lists/'+list.id+'/tasks/'+task.id+'?pp=1&key='+gTask.key, true);
    }

    xhr.setRequestHeader('Authorization', 'OAuth ' + gTask.accessToken);
    xhr.send();
}


function actionUpdateTask() {
    var taskTitle = Ext.getCmp('uptaskTitle').getValue();
    var taskStatus = Ext.getCmp('uptaskStatus');
    var taskDue = Ext.getCmp('uptaskDue').getValue();
    var gtDue = "";
    if(taskDue != null){
        //Sat Jan 01 2011 00:00:00 GMT+0800 (CST)
        //"2011-08-11T00:00:00.000Z"   
        var subdate = taskDue.toString().split(" ");                                
        var month = month2int(subdate[1]);
        gtDue = subdate[3]+"-"+month+"-"+subdate[2]+"T00:00:00.000Z";
    }
    //console.log('Keith: gtDue = '+gtDue);
    var taskNotes = Ext.getCmp('uptaskNotes').getValue();
    console.log('Keith: actionUpdateTask : taskTitle='+taskTitle);
    console.log('Keith: actionUpdateTask : taskStatus='+taskStatus.isChecked()); // see checkbox
    console.log('Keith: actionUpdateTask : gtDue='+gtDue);
    console.log('Keith: actionUpdateTask : taskNotes='+taskNotes);
    setTask(taskTitle, taskStatus, gtDue, taskNotes);
    Ext.getCmp('updateTaskEditor').disable();
    showTasksPanel(gTask.currentListID);
    gTask.cards.setActiveItem(
        gTask.tasksPanel,
        {type:'slide', direction: 'right'}
    );
}

function actionAddTask() {
    var taskTitle = Ext.getCmp('taskTitle').getValue();
    var taskStatus = Ext.getCmp('taskStatus');
    var taskDue = Ext.getCmp('taskDue').getValue();
    var gtDue = "";
    if(taskDue != null){
        //Sat Jan 01 2011 00:00:00 GMT+0800 (CST)
        //"2011-08-11T00:00:00.000Z"   
        var subdate = taskDue.toString().split(" ");                                
        var month = month2int(subdate[1]);
        gtDue = subdate[3]+"-"+month+"-"+subdate[2]+"T00:00:00.000Z";
    }
    //console.log('Keith: gtDue = '+gtDue);
    var taskNotes = Ext.getCmp('taskNotes').getValue();
    console.log('Keith: addTaskToolbar : taskTitle='+taskTitle);
    console.log('Keith: addTaskToolbar : taskStatus='+taskStatus.isChecked()); // see checkbox
    console.log('Keith: addTaskToolbar : gtDue='+gtDue);
    console.log('Keith: addTaskToolbar : taskNotes='+taskNotes);
    addTask(taskTitle, taskStatus, gtDue, taskNotes);
    Ext.getCmp('addTaskEditor').disable();
    showTasksPanel(gTask.currentListID);
    gTask.cards.setActiveItem(
        gTask.tasksPanel,
        {type:'slide', direction: 'right'}
    );
}

function actionAddList() {
    var listname = Ext.getCmp('listname').getValue();
    console.log('Keith: actionAddList : add listname='+listname);
    addList(listname);
    showListsPanel();    
    gTask.cards.setActiveItem(
        gTask.listsPanel,
        {type:'slide', direction: 'right'}
    ); 
}

function showGoogleAccountPage(){
    console.log('Keith: showGoogleAccountPage ...'); 

    if(checkConnection() == false){
        console.log('Keith: showGoogleAccountPage: no connection'); 
        return;
    }
}


function getToken(){

    if (window.location.hash.length == 0) {
        console.log('Keith: No Token');

    } else {
        console.log('Keith: Get Token ... ');
        //Keith:#access_token=ya29.AHES6ZRoq-sqKxroJY6t-aFRROGhX-FwvV3BZmIdInWTlMNUSS1wPSY&token_type=Bearer&expires_in=3600
        var tmpStrings = window.location.hash.split("&");
        var from = 0;
        for(var x=0;x<tmpStrings.length;x++){
            from = tmpStrings[x].search(/access_token=/i);
            if(from==-1){
                ;//console.log('Keith: Get Token ... no token.');
            } else {
                gTask.accessToken =  tmpStrings[x].substring(from+13);
                ;//console.log('Keith: Get Token ... token='+gTask.accessToken);  
            }
        }
        console.log('Keith: Get Token ... token='+gTask.accessToken);
    }
}


function getAccountName(){
    // Account {name=xxx.xxx@gmail.com, type=com.google} 
    var account = hellogap.getAccountName();
    var from =  account.search('name=') + 5;
    var to   =  account.search('@');
    gTask.accountName = account.substring(from, to);
    console.log('Keith: getAccountName = '+gTask.accountName);
}

function getStyle(className) {
    var mclassName = '.'+className;
    var classes = document.styleSheets[1].rules || document.styleSheets[1].cssRules;
    for(var x=0;x<classes.length;x++) {
        //console.log('Keith: x='+classes[x].selectorText);
        if(classes[x].selectorText==mclassName) {
               return classes[x];
        }
    }
}


// =============    Main    ==================== 

console.log('Keith: Main setup...');

//var holidayconfig = document.getElementById('holidayconfig');
//var picoconfig = document.getElementById("picoconfig");//document.className  ,  document.style.xxx
//var picoconfig = getStyle('picoconfig');
//console.log('Keith: Main setup...picoconfig='+picoconfig);
//for (x in picoconfig)
//{
//  console.log('Keith:              picoconfig-'+x+' ->'+ picoconfig[x]);
//} 



//var gTask = {};

Ext.setup({
    fullscreen: true,
	//tabletStartupScreen: 'tablet_startup.png',
	//phoneStartupScreen: 'phone_startup.png',
	//icon: 'icon.png',
	//glossOnIcon: false,
	onReady: goMain
});



function goMain(){

console.log('Keith: setup onReady -> goMain()');

gTask = new Ext.Application({
    name: "GoolgeTaskDemo",

    launch: function() {
        console.log('Keith: Application launch ...');        

        detectWebWorker();

        window.document.body.style.backgroundImage='none';
       
        gTask.accessToken = '';
        gTask.key = 'Use the Google APIs -> Simple API Access -> API key';
        gTask.apiVersion = 'https://www.googleapis.com/tasks/v1';

        gTask.currentListID = '';
        gTask.currentTaskID = '';

        gTask.defaultListID = '';

        gTask.localDataBase = [];
                      /*Task.localDataBase[i] =  //per a set of one list and its tasks
                        {
                           'list': { 
                                     'id': '',      //Google assigned id, or our created 'HTC#' 
                                     'title': '',
                                     'exStatus': '' //add, delete, modify, sync
                                   },
                           'tasks': [],                                          
                                        //{
                                        //  'id': '', 
                                        //  'title': '',
                                        //  'exStatus': '',//add, delete, modify, sync
                                        //  'notes':'',
                                        //  'due': '',     //2011-08-11T00:00:00.000Z
                                        //  'status': ''   //completed, needsAction
                                        //}                                        
                           'updated': true  // true, false
                         };*/
        gTask.accountName = '';
        gTask.itemsOfList = ['id', 'title', 'exStatus'];
        gTask.itemsOfTask = ['id', 'title', 'exStatus', 'notes', 'due', 'status'];
        gTask.refCurrentTasksDB = null;

        gTask.localDBLists = '';
        gTask.localDBTasks = '';

        console.log('Keith: hash=' + window.location.hash);
        console.log('Keith: hash.length=' + window.location.hash.length);


        // Action Sheet  -----------------

        gTask.listsActionSheet = new Ext.ActionSheet({ 
            id: 'listsActionSheet',
            height: '70px',    
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'center',
            },
            style: {
                background: '#F0F0F0',
                margin: '0px 0px',
                padding: '0px',                
            },
            //cls: 'myactionsheetbutton', //never be added into HTML
            items: [       
            {
                //cls: 'myclsadd', success to be added into HTML
                html : '<div class="androidmenuitem">' +
                         '<div class="iconadd"><p> </p></div>' + 
                         '<div class="onespace"><p> </p></div>' +
                         '<p>Add List</p>' +
                       '</div>',
                /*xtype: 'button',
                text : 'Add List',
                icon: 'common_icon_menu_add.png',
                iconAlign: 'top',*/
                style:
                {
                    background: 'none',
                    width: '50%',
                    height: '70px',                    
                    border: '0px'
                },
                handler : function(){
                    gTask.listsActionSheet.hide();
                    gTask.listEditor.reset();                  
                    gTask.cards.setActiveItem(
                        gTask.addListPanel,
                        {type:'slide', direction: 'left'}
                    ); 
                    Ext.getCmp('listname').focus();                   
                    hellogap.showKeyBoard();
                    Ext.getCmp('listname').focus();
                }
            },{
                html : '<div class="androidmenuitem">' +
                         '<div class="iconsync"><p> </p></div>' + 
                         '<div class="onespace"><p> </p></div>' +
                         '<p>Sync</p>' +
                       '</div>',
                /*xtype: 'button',
                text : 'Sync',
                icon: 'common_icon_menu_sync.png',
                iconAlign: 'top',
                */
                style: {
                    background: 'none', 
                    width: '50%',
                    height: '70px',
                    border: '0px'
                },
                handler : function(){
                    gTask.listsActionSheet.hide();
                    //gTask.cards.setLoading(true);//keithtest
                    syncDataBase(true);                 
                }
            },/*{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.listsActionSheet.hide();
                }
            }*/]
        });


        /*gTask.listsActionSheet2 = new Ext.ActionSheet({
            items: [{
                text: 'Delete List',  
                ui: 'decline',              
                handler : function(){
                    gTask.listsActionSheet2.hide();
                    var record = gTask.listsList.myHoldRecord;
                    var title = record.get('title');
                    var id = record.get('id');
                    console.log('Keith: listsActionSheet2 : delete title='+title+', id='+id);
                    deleteList(id);

                    showListsPanel();
                    gTask.cards.setActiveItem(
                        gTask.listsPanel,
                        {type:'fade'}
                    );
                }
            },{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.listsList.getSelectionModel().deselectAll(false);
                    gTask.listsActionSheet2.hide();
                }
            }]
        });*/

        gTask.listsActionSheet2 = new Ext.Panel({
            floating : true, //do not hide/cover background components
            centered: true,
            modal    : true, // mask/disable the background components
            draggable : false,            
            hidden    : true,
            width: '80%',
            stretchX: true,
            stretchY: true,
            layout: {
                type: 'vbox',
                align: 'left'
            },
            dockedItems: [                  
                {
                    id: 'listsActionSheet2Toolbar',
                    dock : 'top',
                    xtype: 'toolbar',             
                    title: ''
                }
            ],
            showAnimation: 'pop',
            hideOnMaskTap : false,
            listeners: {
                beforeshow: function(){   
                    console.log('Keith: listsActionSheet2Toolbar -> beforeshow');
                    Ext.getCmp('listsActionSheet2Toolbar').setTitle('');       
                },
             },
            items: [{
                xtype: 'button',
                text: 'Delete',
                border: '0px',
                handler : function(){
                    gTask.listsActionSheet2.hide();
                    var record = gTask.listsList.myHoldRecord;
                    var title = record.get('title');
                    var id = record.get('id');
                    console.log('Keith: listsActionSheet2 : delete title='+title+', id='+id);
                    deleteList(id);
                    showListsPanel();
                    gTask.cards.setActiveItem(
                        gTask.listsPanel,
                        {type:'fade'}
                    );
                }
            }],
        });



        gTask.tasksActionSheet = new Ext.ActionSheet({
            id: 'tasksActionSheet', 
            height: '70px',               
            layout: {
                type: 'hbox',  
                pack: 'center',                      
                align: 'center',                
            },      
            style: {
                background: '#F0F0F0',
                margin: '0px 0px',
                padding: '0px',
            },
            items: [{
                html : '<div class="androidmenuitem">' +
                           '<div class="iconadd"><p> </p></div>' + 
                           '<div class="onespace"><p> </p></div>' +
                           '<p>Add Task</p>' +
                       '</div>',
                /*xtype: 'button',
                text : 'Add Task',
                icon: 'common_icon_menu_add.png',
                iconAlign: 'top',*/
                style:
                {
                    background: 'none',
                    width: '100%',
                    height: '70px',
                    border: '0px'
                },
                handler :  function(){
                    gTask.tasksActionSheet.hide();
                    Ext.getCmp('addTaskEditor').enable();
                    gTask.addTaskEditor.reset();
                    gTask.cards.setActiveItem(
                        gTask.addTaskPanel,
                        {type:'slide', direction: 'left'}
                    );
                }
            },/*{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.tasksActionSheet.hide();
                }
            }*/]
        });


        /*gTask.tasksActionSheet2 = new Ext.ActionSheet({
            items: [{
                text: 'Delete Task',
                ui: 'decline',
                handler : function(){
                    gTask.tasksActionSheet2.hide();
                    var record = gTask.tasksList.myHoldRecord;
                    var title = record.get('title');
                    var id = record.get('id');
                    console.log('Keith: tasksActionSheet2 : delete title='+title+', id='+id);
                    deleteTask(id);
                    showTasksPanel(gTask.currentListID);
                    gTask.cards.setActiveItem(
                        gTask.tasksPanel,
                        {type:'fade'}
                    );
                }
            },{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.tasksList.getSelectionModel().deselectAll(false);
                    gTask.tasksActionSheet2.hide();
                }
            }]
        });*/
        gTask.tasksActionSheet2 = new Ext.Panel({
            floating : true,
            centered: true,
            modal    : true,
            draggable : false,            
            hidden    : true,
            width: '80%',
            stretchX: true,
            stretchY: true,
            layout: {
                type: 'vbox',
                align: 'left'
            },
            dockedItems: [                  
                {
                    id: 'tasksActionSheet2Toolbar',
                    dock : 'top',
                    xtype: 'toolbar',             
                    title: ''
                }
            ],
            showAnimation: 'pop',
            hideOnMaskTap : false,
            listeners: {
                beforeshow: function(){   
                    console.log('Keith: tasksActionSheet2Toolbar -> beforeshow');
                    Ext.getCmp('tasksActionSheet2Toolbar').setTitle('');       
                },
             },
            items: [{
                xtype: 'button',
                text: 'Delete',
                border: '0px',
                handler : function(){
                    gTask.tasksActionSheet2.hide();
                    var record = gTask.tasksList.myHoldRecord;
                    var title = record.get('title');
                    var id = record.get('id');
                    console.log('Keith: tasksActionSheet2 : delete title='+title+', id='+id);
                    deleteTask(id);
                    showTasksPanel(gTask.currentListID);
                    gTask.cards.setActiveItem(
                        gTask.tasksPanel,
                        {type:'fade'}
                    );
                }
            }],
        });


        gTask.updateTaskActionSheet = new Ext.ActionSheet({
            myIsShow : false,
            listeners: {
                beforehide: function(){
                    console.log('Keith: updateTaskActionSheet -> beforehide');
                    Ext.getCmp('updateTaskEditor').enable();
                }
            },
            //enterAnimation : 'pop',
            //enter : 'top',

            items: [{
                text : 'Update',
                ui: 'decline',
                handler : function(){
                    gTask.updateTaskActionSheet.myIsShow = false;
                    gTask.updateTaskActionSheet.hide();
                    actionUpdateTask();
                }
            },{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.updateTaskActionSheet.myIsShow = false;
                    gTask.updateTaskActionSheet.hide();
                    gTask.cards.setActiveItem(
                        gTask.tasksPanel,
                        {type:'slide', direction: 'right'}
                    );
                }
            }]
        });


        gTask.addTaskActionSheet = new Ext.ActionSheet({
            myIsShow : false,
            listeners: {
                beforehide: function(){
                    console.log('Keith: addTaskActionSheet -> beforehide');
                    Ext.getCmp('addTaskEditor').enable();
                }
            },
            items: [{
                text : 'Add',
                ui: 'decline',
                handler : function(){
                    gTask.addTaskActionSheet.myIsShow = false;
                    gTask.addTaskActionSheet.hide();
                    actionAddTask();
                }
            },{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.addTaskActionSheet.myIsShow = false;
                    gTask.addTaskActionSheet.hide();
                    gTask.cards.setActiveItem(
                        gTask.tasksPanel,
                        {type:'slide', direction: 'right'}
                    );
                }
            }]
        });


        gTask.addListActionSheet = new Ext.ActionSheet({
            myIsShow : false,
            items: [{
                text : 'Add',
                ui: 'decline',
                handler : function(){
                    gTask.addListActionSheet.myIsShow = false;
                    gTask.addListActionSheet.hide();
                    actionAddList();
                }
            },{
                text : 'Cancel',
                scope : this,
                handler : function(){
                    gTask.addListActionSheet.myIsShow = false;
                    gTask.addListActionSheet.hide();
                    gTask.cards.setActiveItem(
                        gTask.listsPanel,
                        {type:'slide', direction: 'right'}
                    );
                }
            }]
        });


        // menuKeyDown --------------------------

        gTask.menuKeyDown = function onMenuKeyDown() {
            var id = gTask.cards.getActiveItem().id;
            console.log('Keith: onMenuKeyDown: current ActiveItem='+ id); 
            
            //hellogap.loopA();
            //window.myiframe.jsiframetest();
            //hellogap.runOnAnotherTherad();
            //var i = 0;        
            //hellogap.requestToken();
            //gTestValue = 0;
            //for(i=0;i<25000;i++){
            //    console.log('Keith: ---------   gTestValue='+gTestValue); 
            //}
            

            //console.log('Keith: ---------'+gTask.listsActionSheet.getEl().getHTML());//keithtest
            console.log('Keith: ---------'+gTask.listEditor.getEl().getHTML());//keithtest

            if( gTask.listsList.myIsSearch == true ||
                gTask.tasksList.myIsSearch == true
            ){                
                return; 
            }
 
            if(id == 'listsPanel'){
                if(gTask.listsActionSheet2.isHidden()){           
                    if(gTask.listsActionSheet.isHidden()){
                        gTask.listsActionSheet.show();                        
                    } else {
                        gTask.listsActionSheet.hide();
                    }
                } else {
                    gTask.listsList.getSelectionModel().deselectAll(false);
                    gTask.listsActionSheet2.hide();
                }
            } else if(id == 'tasksPanel'){
                if(gTask.tasksActionSheet2.isHidden()){
                    if(gTask.tasksActionSheet.isHidden()){
                        gTask.tasksActionSheet.show();
                    } else {
                        gTask.tasksActionSheet.hide();
                    }
                } else {
                    gTask.tasksList.getSelectionModel().deselectAll(false);
                    gTask.tasksActionSheet2.hide();
                }
            } else if(id == 'updateTaskPanel'){
                /*if(gTask.updateTaskActionSheet.myIsShow == false){
                    gTask.updateTaskActionSheet.myIsShow = true;
                    hellogap.hideKeyBoard();
                    Ext.getCmp('uptaskDue').getDatePicker().hide();
                    Ext.getCmp('updateTaskEditor').disable();
                    setTimeout('gTask.updateTaskActionSheet.show();', 200);
                } else {
                    if(gTask.updateTaskActionSheet.isHidden() == false){
                        gTask.updateTaskActionSheet.myIsShow = false;
                        gTask.updateTaskActionSheet.hide();
                    }
                }*/
            } else if(id == 'addTaskPanel'){
                /*if(gTask.addTaskActionSheet.myIsShow == false){
                    gTask.addTaskActionSheet.myIsShow = true;
                    hellogap.hideKeyBoard();
                    Ext.getCmp('taskDue').getDatePicker().hide();
                    Ext.getCmp('addTaskEditor').disable();
                    setTimeout('gTask.addTaskActionSheet.show();', 200);                    
                } else {
                    if(gTask.addTaskActionSheet.isHidden() == false){
                        gTask.addTaskActionSheet.myIsShow = false;
                        gTask.addTaskActionSheet.hide();
                    }    
                }*/
            } else if(id == 'addListPanel'){
                /*if(gTask.addListActionSheet.myIsShow == false){
                    gTask.addListActionSheet.myIsShow = true;
                    hellogap.hideKeyBoard();
                    setTimeout('gTask.addListActionSheet.show();', 200);
                } else {
                    if(gTask.addListActionSheet.isHidden() == false){
                        gTask.addListActionSheet.myIsShow = false;
                        gTask.addListActionSheet.hide();
                    }
                }*/
            } else {
                console.log('Keith: onMenuKeyDown: fail to show '+ id);
            }
        };

        document.addEventListener("menubutton", gTask.menuKeyDown, false);// <-- from PhoneGap doc : event types


        // backKeyDown --------------------------

        gTask.backKeyDown = function onBackKeyDown() {
            var id = gTask.cards.getActiveItem().id;
            console.log('Keith: onBackKeyDown: current ActiveItem='+ id);
        
            //gTestValue = 0;

            gTask.cards.setLoading(false);

            if( gTask.listsList.myIsSearch == true || 
                gTask.tasksList.myIsSearch == true
            ){
                gTask.searchKeyDown();
                return; 
            }

            if(id == 'listsPanel'){
                if(gTask.listsActionSheet2.isHidden()){
                    if(gTask.listsActionSheet.isHidden()){
                        saveDBtoNative();
                        navigator.app.exitApp();
                        //BackButton.exitApp();                                    
                    } else {
                        gTask.listsActionSheet.hide();
                    }
                } else {
                    gTask.listsList.getSelectionModel().deselectAll(false);
                    gTask.listsActionSheet2.hide();
                }                    
            } else if(id == 'tasksPanel'){
                if(gTask.tasksActionSheet2.isHidden()){
                    if(gTask.tasksActionSheet.isHidden()){
                        showListsPanel();
                        gTask.cards.setActiveItem(
                            gTask.listsPanel,
                            {type:'slide', direction: 'right'}
                        );
                    } else {
                        gTask.tasksActionSheet.hide();
                    }
                } else {
                    gTask.tasksList.getSelectionModel().deselectAll(false);
                    gTask.tasksActionSheet2.hide();
                }
            } else if(id == 'updateTaskPanel'){
                if(gTask.updateTaskActionSheet.myIsShow == false){
                    var datePicker = Ext.getCmp('uptaskDue').getDatePicker();
                    if(datePicker.isHidden()){        
                        gTask.cards.setActiveItem(
                            gTask.tasksPanel,
                            {type:'slide', direction: 'right'}
                        );
                    } else {
                        datePicker.hide();
                    }
                } else {
                    if(gTask.updateTaskActionSheet.isHidden() == false){
                        gTask.updateTaskActionSheet.myIsShow = false;
                        gTask.updateTaskActionSheet.hide();
                    }
                }
            } else if(id == 'addTaskPanel'){
                if(gTask.addTaskActionSheet.myIsShow == false){
                    var datePicker = Ext.getCmp('taskDue').getDatePicker();
                    if(datePicker.isHidden()){     
                        gTask.cards.setActiveItem(
                            gTask.tasksPanel,
                            {type:'slide', direction: 'right'}
                        );
                    } else {
                        datePicker.hide();
                    }
                } else {
                    if(gTask.addTaskActionSheet.isHidden() == false){
                        gTask.addTaskActionSheet.myIsShow = false;
                        gTask.addTaskActionSheet.hide();
                    }
                }
            } else if(id == 'addListPanel'){
                if(gTask.addListActionSheet.myIsShow == false){
                    gTask.cards.setActiveItem(
                        gTask.listsPanel,
                        {type:'slide', direction: 'right'}
                    );
                } else {
                    if(gTask.addListActionSheet.isHidden() == false){
                        gTask.addListActionSheet.myIsShow = false;
                        gTask.addListActionSheet.hide();
                    }
                }   
            } else {
                console.log('Keith: onBackKeyDown: fail to back');
            }
        }
        
        document.addEventListener("backbutton", gTask.backKeyDown, false); // <-- from PhoneGap doc : event types



        // searchKeyDown --------------------------
        gTask.searchKeyDown = function onSearchKeyDown() {
            console.log('Keith: searchKeyDown ...');

            if(gTask.cards.loadMask != null){
                console.log('Keith: searchKeyDown ... loadMask');
                return;
            }    

            var cardid = gTask.cards.getActiveItem().id;      

            if(cardid == 'listsPanel'){
                if( gTask.listsActionSheet.isVisible()  ||
                    gTask.listsActionSheet2.isVisible()    ){
                    return;
                }

                if(gTask.listsList.myIsSearch == true){
                    console.log('Keith: searchKeyDown ...hide');
                    hideListsSearchItem();
                    gTask.listsList.refresh();    
                } else {
                    console.log('Keith: searchKeyDown ...show');                    
                    showListsSearchItem();
                }
            
            } else if(cardid == 'tasksPanel') {
                if( gTask.tasksActionSheet.isVisible()  ||
                    gTask.tasksActionSheet2.isVisible()    ){
                    return;
                }

                if(gTask.tasksList.myIsSearch == true){
                    console.log('Keith: searchKeyDown ...hide');                    
                    hideTasksSearchItem();
                    gTask.tasksList.refresh();    
                } else {
                    console.log('Keith: searchKeyDown ...show');                    
                    showTasksSearchItem();
                }
            }   
        }

        gTask.searchItem = {
                              xtype: 'searchfield',
                              itemId: 'searchItem',
                              flex: 1,
                              listeners: {
                                  keyup: keywordSearch                                
                              }
                           };

        document.addEventListener("searchbutton", gTask.searchKeyDown, false);// <-- from PhoneGap doc : event types

        //Lists Panel---------------------------------------------------

        gTask.listsToolbar = new Ext.Toolbar({
            dock : 'top',
            title: 'My Lists',
        });

        Ext.regModel('Lists',
            { fields: ['kind', 'etag'],
              hasMany: { model: 'Item', name: 'items'}
            }
        );

        Ext.regModel('Item',
            { fields: ['kind', 'id', 'title', 'selfLink'] ,
              belongsTo: 'Lists'
            } 
        );

        gTask.storeLists = new Ext.data.JsonStore({
            model  : 'Item',
            sorters: 'title',

            getGroupString : function(record) {
                return record.get('kind')[0];
            },

            //proxy: {
            //    type: 'localstorage',
            //    id: 'storeLists'
            //},

            //data: [ ]
        });

        gTask.listsList = new Ext.List({
            myIsTaphold: false,
            myHoldRecord: {},
            myIsSearch: false,
            id: 'listsList',
            fullscreen: true,
            singleSelect : true,         
            listeners: {
                itemtap: function(list, index, item, event){
                    console.log('Keith: Lists Panel: itemtap-> myIsTaphold='+gTask.listsList.myIsTaphold);
                    var record = list.store.getAt(index);                    
                    if(gTask.listsList.myIsTaphold == true){ // taphold                        
                        console.log('Keith: Lists Panel: delete list -> record='+record.get('title')+', index='+index);
                        gTask.listsList.myHoldRecord = record;
                        list.getSelectionModel().select(record, false, false);
                        var title = record.get('title');
                        Ext.getCmp('listsActionSheet2Toolbar').setTitle(title);
                        gTask.listsList.myIsTaphold = false;
                    } else { //tap                        
                        console.log('Keith: Lists Panel: go tasks panel: record='+record.get('title')+', index='+index);
                        gTask.currentListID = record.get('id');
                        gTask.tasksToolbar.setTitle(record.get('title'));
                        showTasksPanel(gTask.currentListID);
                        hideListsSearchItem();  
                        gTask.cards.setActiveItem(gTask.tasksPanel);
                    }
                },
                el: {
                    taphold: function(){ 
                        gTask.listsList.myIsTaphold = true;
                        console.log('Keith: Lists Panel: taphold -> myIsTaphold='+gTask.listsList.myIsTaphold);
                        gTask.listsActionSheet2.show();
                    }
                },
                //scope: this,
                //single: true
            }, 
            /*
            onListItemTap: function(list, index, item, e)   {
                var record = list.store.getAt(index);
                console.log('Keith: Lists Panel: go tasks panel: record='+record.get('title')+', index='+index);
                gTask.currentListID = record.get('id');
                gTask.tasksToolbar.setTitle(record.get('title'));
                showTasksPanel(gTask.currentListID);               
                gTask.cards.setActiveItem(gTask.tasksPanel);
            },*/
            /*onItemDisclosure : function(record, btn, index){
                console.log('Keith: Lists Panel: go tasks panel: record='+record.get('title')+', btn='+btn+', index='+index);
                gTask.currentListID = record.get('id');
                gTask.tasksToolbar.setTitle(record.get('title'));
                showTasksPanel(gTask.currentListID);               
                gTask.cards.setActiveItem(gTask.tasksPanel);                
            },*/ 
            itemTpl : new Ext.XTemplate(
                          '<div class="tasksflexbox">', 
                              '<div class="listLeftNode">',
                                '<p> </p>',
                              '</div>',

                              '<div class="space">',
                                  '<p> </p>',
                              '</div>', 

                              '<div class="listTitle">',
                                 '<p><b>{title}</p></b>',
                              '</div>',
                            
                              '<div class="numOfTasks">',
                                 '({[getNumOfDoneTasks(values.id)]}/{[getNumOfTasks(values.id)]})',
                              '</div>', 
                          '</div>'
                      ),
            store: gTask.storeLists
        });

        gTask.listsPanel = new Ext.Panel({
            id: 'listsPanel',
            fullscreen: true,
            dockedItems: [
                gTask.listsToolbar,
            ],
            items: [
                gTask.listsList           
            ]
        });




        // Tasks Panel ---------------------------------------------------

        gTask.tasksToolbar = new Ext.Toolbar({
            dock : 'top',
            title: '',
            items: [
                /*{
                    text: 'My Lists',
                    itemId: 'MyListsBack',
                    ui: 'back',
                    listeners: {
                        tap: function () {
                            showListsPanel();
                            gTask.cards.setActiveItem(
                                gTask.listsPanel,
                                {type:'slide', direction: 'right'}
                            );                            
                        }
                    }
                }*/
            ]
        });


        Ext.regModel('Tasks',
            { fields: ['kind', 'id', 'etag', 'title', 'updated', 'selfLink', 'parent', 'position', 'notes',
                       'status', 'due', 'completed', 'deleted', 'hidden'] }
        );

        gTask.storeTasks = new Ext.data.JsonStore({
            model  : 'Tasks',
            sorters: 'title',

            //getGroupString : function(record) {
            //    return record.get('title')[0];
            //},

            //data: [ ]
        });

        gTask.tasksList = new Ext.List({
            myIsTaphold: false,
            myHoldRecord: {},
            myIsSearch: false,
            // sequence of event firing: taphold,  itemtap ,   tap,  onCompletedClicked
            //onCompletedClicked: function(){
                //'<input id="check" type="button" name="1" value="1" onClick="gTask.tasksList.onCompletedClicked()" />',                
                //console.log('Keith: onCompletedClicked ...');          
            //},
            id: 'tasksList',
            fullscreen: true,
            //blockRefresh : true,
            listeners: {
                itemtap: function(list, index, item, event){
                    console.log('Keith: Tasks Panel: itemtap-> myIsTaphold='+gTask.tasksList.myIsTaphold);
                    //for (x in event)
                    //{
                    //  console.log('Keith:              event-'+x+' ->'+ event[x]);
                    //}
                    var record = list.store.getAt(index);                    
                    if(gTask.tasksList.myIsTaphold == true){ // taphold                     
                        console.log('Keith: Tasks Panel: delete list -> record='+record.get('title')+', index='+index);
                        gTask.tasksList.myHoldRecord = record;
                        list.getSelectionModel().select(record, false, false);
                        var title = record.get('title');
                        Ext.getCmp('tasksActionSheet2Toolbar').setTitle(title);
                        gTask.tasksList.myIsTaphold = false;
                    } else { //tap                 
                        console.log('Keith: Tasks Panel: tap: event.startX='+event.startX);
                        if(event.startX < 70){
                            console.log('Keith: Tasks Panel: checked: record='+record.get('title')+', index='+index);
                            changeTaskStatus(gTask.currentListID,record.get('id'));                            
                            showTasksPanel(gTask.currentListID);
                        } else { 
                            console.log('Keith: Tasks Panel: go to update task panel: record='+record.get('title')+', index='+index);
                            //gTask.updateTaskToolbar.setTitle(record.get('title'));
                            gTask.updateTaskEditor.reset();
                            hideTasksSearchItem();
                            gTask.currentTaskID = record.get('id'); 
                            gTask.cards.setActiveItem(
                                gTask.updateTaskPanel,
                                {type:'slide', direction: 'left'}
                            );  
                            showUpdateTaskEditor(record.get('id'));
                        }
                    }
                },
                el: {
                    tap: function(){ console.log('Keith: Tasks Panel: tap.'); },
                    taphold: function(){ 
                        gTask.tasksList.myIsTaphold = true;
                        console.log('Keith: Tasks Panel: taphold -> myIsTaphold='+gTask.tasksList.myIsTaphold);
                        gTask.tasksActionSheet2.show();
                    }
                },
                //refresh : function(){ console.log('Keith: Tasks Panel: refresh.'); },
                //render  : function(){ console.log('Keith: Tasks Panel: render .'); }
            },

            itemTpl : new Ext.XTemplate(
                          '<div class="tasksflexbox">',  
                              '<div class="listLeftNode">',
                                '<p> </p>',
                              '</div>',

                              '<div class="space">',
                                  '<p> </p>',
                              '</div>',
                            
                              '<tpl if="values.status==\'needsAction\'">',
                                '<div class="needsactioncheckbox">',
                                    '<p> </p>',
                                '</div>',
                              '</tpl>',
                              '<tpl if="values.status==\'completed\'">',
                                '<div class="completedcheckbox">',
                                    '<p> </p>',
                                '</div>',
                              '</tpl>',
                              '<div class="space">',
                                  '<p> </p>',
                              '</div>',
                              
                              '<tpl if="values.status==\'needsAction\'">', 
                                   '<div class="needsactiontext">',
                                       '<p><B>{title}</B></p>',
                                       '<p><SMALL>{notes}</SMALL></p>', 
                                       //'<p><SMALL><I>{[values.due.substring(0,10)]}</I></SMALL></p>',
                                   '</div>',
                              '</tpl>',
                              '<tpl if="values.status==\'completed\'">',
                                   '<div class="completedtext">',
                                       '<p><B>{title}</B></p>',
                                       '<p><SMALL>{notes}</SMALL></p>', 
                                       //'<p><SMALL><I>{[values.due.substring(0,10)]}</I></SMALL></p>',
                                   '</div>',
                              '</tpl>',
                              
                              '<div class="dueday">',
                                '<p><SMALL><I>{[values.due.substring(0,10)]}</I></SMALL></p>',
                              '</div>',

                           '</div>'                
                          ), 

            store: gTask.storeTasks,
        });

        gTask.tasksPanel = new Ext.Panel({
            id: 'tasksPanel',
            fullscreen: true,
            dockedItems: [ gTask.tasksToolbar ],
            items: [
                gTask.tasksList          
            ]
        });





        //Update Task Panel ---------------------------------------------------

        gTask.updateTaskToolbar = new Ext.Toolbar({
            dock : 'top',
            title: 'Edit details',
            items: [
                /*{
                    text: 'back',
                    ui: 'back',
                    listeners: {
                        tap: function () {
                            showTasksPanel(gTask.currentListID);
                            gTask.cards.setActiveItem(
                                gTask.tasksPanel,
                                {type:'slide', direction: 'right'}
                            );
                        }
                    }
                },
                { xtype: 'spacer' },
                {
                    text: 'update',
                    ui: 'action',
                    listeners: {
                        tap: actionUpdateTask
                    }
                }*/
            ]
        });

        gTask.updateTaskToolbar2 = new Ext.Toolbar({
            id: 'updateTaskToolbar',
            //height: '13%', //holiday is 10%
            height: '10%',    
            dock : 'bottom',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },                    
                    //ui: 'confirm',
                    flex: 1,
                    text: '<span style="font-size:150%">Save</span>',                      
                    listeners: {
                        tap: actionUpdateTask
                    }
                },
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },
                    //ui: 'decline',
                    flex: 1,
                    text: '<span style="font-size:150%">Cancel</span>',
                    listeners: {
                        tap: function () {
                            Ext.getCmp('updateTaskEditor').disable();
                            showTasksPanel(gTask.currentListID);
                            gTask.cards.setActiveItem(
                                gTask.tasksPanel,
                                {type:'slide', direction: 'right'}
                            );
                        }
                    }
                }
            ]
        });

        gTask.updateTaskEditor = new Ext.form.FormPanel({
            id: 'updateTaskEditor',
            //fullscreen: true,
            //height: '87%', //holiday is 90%
            height: '90%',
            //layout: 'anchor',
            items: [ { 
                        id: 'uptaskTitle',
                        xtype: 'textfield',
                        useClearIcon: true,                        
                        //placeHolder: 'task title',
                        name : 'title',
                        label: 'title',    
                        //labelWidth: '34%',   //work well  //holiday is 30% 
                        labelWidth: '30%',                                           
                     }, {
                        id: 'uptaskStatus',
                        xtype: 'checkboxfield',
                        name : 'status',
                        label: 'completed',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%', 
                     }, {
                        id: 'uptaskDue',
                        xtype: 'datepickerfield',                        
                        //override the onMaskTap that is trigered after touch "donw/edit" icon.
                        onMaskTap: function() {
                            console.log('Keith: uptaskDue -> onMaskTap');
                            if (Ext.form.DatePicker.superclass.onMaskTap.apply(this, arguments) !== true) {
                                return false;
                            }                            
                            hellogap.hideKeyBoard();
                            setTimeout("Ext.getCmp('uptaskDue').getDatePicker().show();", 200);
                        },
                        picker: { 
                              id: 'uptaskDuePicker',                                    
                              yearFrom: new Date().getFullYear(), 
                              yearTo: new Date().getFullYear() + 5, 
                              listeners: {
                                  beforeshow: function(){
                                      console.log('Keith: uptaskDue -> picker -> beforeshow');                                          
                                      //Ext.getCmp('uptaskTitle').blur();
                                      //Ext.getCmp('uptaskNotes').blur();
                                      Ext.getCmp('updateTaskEditor').disable();
                                  },
                                  beforehide: function(){
                                      console.log('Keith: uptaskDue -> picker -> beforehide');
                                      Ext.getCmp('updateTaskEditor').enable();
                                  }
                               },
                        },
                        name : 'due',
                        label: 'Due Day',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%', 
                     }, {
                        id: 'uptaskNotes',
                        xtype: 'textareafield',
                        //maxRows: '10',      //holiday is 17
                        maxRows: '17',
                        name : 'notes',
                        label: 'Notes',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%', 
                     }
                   ]

        });

        gTask.updateTaskPanel = new Ext.Panel({
            id: 'updateTaskPanel',
            fullscreen: true,
            items:[ gTask.updateTaskEditor ],
            dockedItems: [gTask.updateTaskToolbar2],
            monitorOrientation : true,
            listeners: {
                beforeorientationchange: function (thisPanel, orientation, width, height) {
                    console.log('Keith: updateTaskPanel -> beforeorientationchange : ');
                    console.log('Keith:                                            : orientation='+orientation);
                    console.log('Keith:                                            : width='+width);    
                    console.log('Keith:                                            : height='+height);
                    //console.log('Keith:               : updateTaskToolbar='+thisPanel.getComponent('updateTaskToolbar'));
                    var com1   = thisPanel.getComponent('updateTaskEditor');
                    var com1i4 = thisPanel.getComponent('uptaskNotes');
                    var com2   = thisPanel.getComponent('updateTaskToolbar');
                    if(orientation == 'landscape'){  //Holiday(w=604, h=335)
                        com1.setHeight('80%');
                        //com1i4.maxRows = 17;
                        com2.setHeight('20%');                                             
                    } else {//portrait, Holiday(w=360, h=615)
                        //com1.setHeight('87%'); //holiday is 90%
                        com1.setHeight('90%');
                        //com1i4.maxRows = 5;
                        //com2.setHeight('13%'); //holiday is 10%    
                        com2.setHeight('10%');                   
                    }
                    thisPanel.doComponentLayout();
                }
            }
        }); 


        //Edit List Panel ------------------------------------------
        gTask.editListToolbar =  new Ext.Toolbar({
            dock : 'top',
            title: 'Add List',
            items: [
                { 
                    text: 'cancel',
                    ui: 'back',
                    listeners: {
                        tap: function () {  
                            showListsPanel();                                          
                            gTask.cards.setActiveItem(
                                gTask.listsPanel,
                                {type:'slide', direction: 'left'}
                            );                        
                        }
                    }
                },
                { xtype: 'spacer' },
                {
                    text: 'add',
                    ui: 'action',
                    listeners: {
                        tap: function () {
                            var listname = Ext.getCmp('listname').getValue();
                            console.log('Keith: editListToolbar : save name='+listname);
                            addList(listname);
                            showListsPanel();    
                            gTask.cards.setActiveItem(
                                gTask.listsPanel,
                                {type:'slide', direction: 'left'}
                            ); 
                        }
                    }
                }
            ]
        });

        gTask.addListToolbar2 = new Ext.Toolbar({
            id: 'addListToolbar2',
            //height: '13%',//holiday is 10%
            height: '10%',
            dock : 'bottom',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },                    
                    flex: 1,
                    text: '<span style="font-size:150%">Save</span>',                      
                    listeners: {
                        tap: actionAddList
                    }
                },
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },
                    flex: 1,
                    text: '<span style="font-size:150%">Cancel</span>',
                    listeners: {
                        tap: function () {
                            showListsPanel();
                            gTask.cards.setActiveItem(
                                gTask.listsPanel,
                                {type:'slide', direction: 'right'}
                            );
                        }
                    }
                }
            ]
        });


        //<div class="x-panel-body" id="ext-gen1067" style="left: 0px; top: 0px; ">
        //  <div id="listname" class=" x-field x-field-text x-label-align-left x-field-focus">
        //    <div class="x-form-label" id="ext-gen1071" style="width: 30%; ">
        //        <span>List Name</span>
        //    </div>
        //    <div class="x-form-field-container">
        //      <input id="ext-gen1070" type="text" name="listname" class="x-input-text" placeholder="name">
        //    </div>
        //  </div>
        //</div>
        gTask.listEditor = new Ext.form.FormPanel({
            id: 'listEditor',
            //labelWidth: 200,// not work
            items: [{ 
                      id: 'listname',
                      //cls: 'myformstyle',
                      xtype: 'textfield',
                      placeHolder: 'name',
                      name : 'listname',
                      label: 'List Name',
                      //labelWidth: '34%',   //work well  //holiday is 30%
                      labelWidth: '30%', 
                      /*listeners: {
                          beforerender: function() {  
                              console.log('Keith: beforerender ... picoconfig.style.labelWidth='+picoconfig.style.labelWidth);
                              for (x in picoconfig.style)
                                {
                                  console.log('Keith:              picoconfig.style-'+x+' ->'+ picoconfig.style[x]);
                                }
                              //console.log('Keith:              labelWidth='+picoconfig.style.getPropertyCSSValue('labelWidth')); ans is null
                              //console.log('Keith:              labelWidth='+picoconfig.style.getPropertyValue('labelWidth')); ans is null
                              this.labelWidth = picoconfig.style.labelWidth;
                          }
                      }*/
            }]
        });

        gTask.addListPanel = new Ext.Panel({
            id: 'addListPanel',
            //dockedItems: [gTask.editListToolbar],   
            fullscreen: true,
            items:[ gTask.listEditor ],
            dockedItems: [gTask.addListToolbar2],
            monitorOrientation : true,
            listeners: {
                beforeorientationchange: function (thisPanel, orientation, width, height) {
                    console.log('Keith: addListPanel -> beforeorientationchange : ');
                    console.log('Keith:                                            : orientation='+orientation);
                    console.log('Keith:                                            : width='+width);    
                    console.log('Keith:                                            : height='+height);
                    //console.log('Keith:               : updateTaskToolbar='+thisPanel.getComponent('updateTaskToolbar'));
                    //var com1   = thisPanel.getComponent('listEditor');
                    var com2   = thisPanel.getComponent('addListToolbar2');
                    if(orientation == 'landscape'){  //Holiday(w=604, h=335)
                        //com1.setHeight('80%');
                        com2.setHeight('20%');  //holiday is 20%                                        
                    } else {//portrait, Holiday(w=360, h=615)
                        //com1.setHeight('90%');
                        //com2.setHeight('13%');  //holiday is 10%                      
                        com2.setHeight('10%');
                    }
                    thisPanel.doComponentLayout();
                }
            }
        }); 

        //Add Task Panel ------------------------------------------ 
        gTask.addTaskToolbar =  new Ext.Toolbar({            
            dock : 'top',
            title: 'Add Task',
            items: [
                { 
                    text: 'cancel',
                    ui: 'back',
                    listeners: {
                        tap: function () {      
                            showTasksPanel(gTask.currentListID);                    
                            gTask.cards.setActiveItem(
                                gTask.tasksPanel,
                                {type:'slide', direction: 'right'}
                            );                            
                        }
                    }
                },
                { xtype: 'spacer' },
                {
                    text: 'add',
                    ui: 'action',
                    listeners: {
                        tap: function () {
                            var taskTitle = Ext.getCmp('taskTitle').getValue();
                            var taskStatus = Ext.getCmp('taskStatus');
                            var taskDue = Ext.getCmp('taskDue').getValue();
                            var gtDue = "";
                            if(taskDue != null){
                                //Sat Jan 01 2011 00:00:00 GMT+0800 (CST)
                                //"2011-08-11T00:00:00.000Z"   
                                var subdate = taskDue.toString().split(" ");                                
                                var month = month2int(subdate[1]);
                                gtDue = subdate[3]+"-"+month+"-"+subdate[2]+"T00:00:00.000Z";
                            }
                            //console.log('Keith: gtDue = '+gtDue);
                            var taskNotes = Ext.getCmp('taskNotes').getValue();
                            console.log('Keith: addTaskToolbar : save taskTitle='+taskTitle);
                            console.log('Keith: addTaskToolbar : save taskStatus='+taskStatus.isChecked()); // see checkbox
                            console.log('Keith: addTaskToolbar : save gtDue='+gtDue);
                            console.log('Keith: addTaskToolbar : save taskNotes='+taskNotes);
                            addTask(taskTitle, taskStatus, gtDue, taskNotes);
                            showTasksPanel(gTask.currentListID);
                            gTask.cards.setActiveItem(
                                gTask.tasksPanel,
                                {type:'slide', direction: 'left'}
                            );
                        }
                    }
                }
            ]
        });  

        gTask.addTaskToolbar2 = new Ext.Toolbar({
            id: 'addTaskToolbar2',
            //height: '13%',//holiday is 10%
            height: '10%',
            dock : 'bottom',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },                    
                    //ui: 'confirm',
                    flex: 1,
                    text: '<span style="font-size:150%">Save</span>',                      
                    listeners: {
                        tap: actionAddTask
                    }
                },
                {
                    xtype: 'button',
                    style: {
                        border: '1px solid #65655E',
                    },
                    //ui: 'decline',
                    flex: 1,
                    text: '<span style="font-size:150%">Cancel</span>',
                    listeners: {
                        tap: function () {
                            Ext.getCmp('addTaskEditor').disable();
                            showTasksPanel(gTask.currentListID);
                            gTask.cards.setActiveItem(
                                gTask.tasksPanel,
                                {type:'slide', direction: 'right'}
                            );
                        }
                    }
                }
            ]
        });
     

        gTask.addTaskEditor = new Ext.form.FormPanel({
            id: 'addTaskEditor',
            //fullscreen: true,
            //height: '87%', //holiday is 90%
            height: '90%',
            items: [ { 
                        id: 'taskTitle',
                        xtype: 'textfield',
                        useClearIcon: true,
                        placeHolder: 'task title',
                        name : 'taskTitle',
                        label: 'title',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%',
                     }, {
                        id: 'taskStatus',
                        xtype: 'checkboxfield',
                        name : 'taskStatus',
                        label: 'completed',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%',
                     }, {
                        id: 'taskDue',
                        xtype: 'datepickerfield',
                        //override the onMaskTap that is trigered after touch "donw/edit" icon.
                        onMaskTap: function() {
                            console.log('Keith: taskDue -> onMaskTap');
                            if (Ext.form.DatePicker.superclass.onMaskTap.apply(this, arguments) !== true) {
                                return false;
                            }                            
                            hellogap.hideKeyBoard();
                            setTimeout("Ext.getCmp('taskDue').getDatePicker().show();", 200);
                        }, 
                        picker: { 
                              yearFrom: new Date().getFullYear(), 
                              yearTo: new Date().getFullYear() + 5, 
                              listeners: {
                                  beforeshow: function(){
                                      console.log('Keith: taskDue -> picker -> beforeshow');
                                      Ext.getCmp('addTaskEditor').disable();
                                  },
                                  beforehide: function(){
                                      console.log('Keith: taskDue -> picker -> beforehide');
                                      Ext.getCmp('addTaskEditor').enable();
                                  }
                               },
                        },
                        name : 'taskDue',
                        label: 'Due Day',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%',
                     }, {
                        id: 'taskNotes',
                        xtype: 'textareafield',
                        placeHolder: 'notes',
                        //maxRows: '10',      //holiday is 17
                        maxRows: '17',
                        name : 'taskNotes',
                        label: 'Notes',
                        //labelWidth: '34%',   //work well  //holiday is 30%
                        labelWidth: '30%',
                     }
                   ]
        });

        gTask.addTaskPanel = new Ext.Panel({
            id: 'addTaskPanel',             
            fullscreen: true,
            items:[ gTask.addTaskEditor ],
            dockedItems: [gTask.addTaskToolbar2],
            monitorOrientation : true,
            listeners: {
                beforeorientationchange: function (thisPanel, orientation, width, height) {
                    console.log('Keith: addTaskPanel -> beforeorientationchange : ');
                    console.log('Keith:                                            : orientation='+orientation);
                    console.log('Keith:                                            : width='+width);    
                    console.log('Keith:                                            : height='+height);
                    //console.log('Keith:               : updateTaskToolbar='+thisPanel.getComponent('updateTaskToolbar'));
                    var com1   = thisPanel.getComponent('addTaskEditor');
                    var com1i4 = thisPanel.getComponent('taskNotes');
                    var com2   = thisPanel.getComponent('addTaskToolbar2');
                    if(orientation == 'landscape'){  //Holiday(w=604, h=335)
                        com1.setHeight('80%');
                        //com1i4.maxRows = 17;
                        com2.setHeight('20%');                                             
                    } else {//portrait, Holiday(w=360, h=615)
                        //com1.setHeight('87%');//holiday is 90%
                        com1.setHeight('90%');
                        //com1i4.maxRows = 5;
                        //com2.setHeight('13%');//holiday is 10%                        
                        com2.setHeight('10%');
                    }
                    thisPanel.doComponentLayout();
                }
            }
        });



        // Main Panel ------------------------------------------
        gTask.cards = new Ext.Panel({
            id: 'mainPanel',
            //dockedItems: [gTask.toolbar],
            layout    : 'card',
            //cls: 'panelcards',
            fullscreen: true,
            cardSwitchAnimation: 'slide',
            items: [                
                gTask.listsPanel,
                gTask.tasksPanel,
                gTask.updateTaskPanel,
                gTask.addListPanel,
                gTask.addTaskPanel,
            ]
        });



        // Go Go -------------------------------------------------------
        gTask.cards.setLoading(true);

        getToken();
        getAccountName();

        readDBfromNative();

        showListsPanel();

        syncCodes();

        //gTestValue = 0;
        //var itest = 0;
        //for(itest=0;itest<15000;itest++){
        //    console.log('Keith: Go Go ...' +  itest);
        //}

     
    } //launch: function()
});//end new Ext.Application()
}//end goMain()












