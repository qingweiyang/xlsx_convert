/**
 * 加载页面完成后从后台接受数据
 * 
 */
$(document).ready(function(){
	$.get(
		"XlsxconvertServlet",
		function(data) {
			resultGlobal = eval(data);
			//展示数据表格
//			$("#starter").hide();
			show(getInitialData(), 1, resultGlobal.length - 2);
			$("#show-table").show();
	});
});
	
var X = XLSX;
var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	rABS: './lib/js-xlsx-master/xlsxworker2.js',
	norABS: './lib/js-xlsx-master/xlsxworker1.js',
	noxfer: './lib/js-xlsx-master/xlsxworker.js'
};
var wtf_mode = false;

function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

function ab2str(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
	return o;
}

function s2ab(s) {
	var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
	for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
	return [v, b];
}

function xw_noxfer(data, cb) {
	var worker = new Worker(XW.noxfer);
	worker.onmessage = function(e) {
		switch(e.data.t) {
			case 'ready': break;
			case 'e': console.error(e.data.d); break;
			case XW.msg: cb(JSON.parse(e.data.d)); break;
		}
	};
	var arr = rABS ? data : btoa(fixdata(data));
	worker.postMessage({d:arr,b:rABS});
}

function xw_xfer(data, cb) {
	var worker = new Worker(rABS ? XW.rABS : XW.norABS);
	worker.onmessage = function(e) {
		switch(e.data.t) {
			case 'ready': break;
			case 'e': console.error(e.data.d); break;
			default: xx=ab2str(e.data).replace(/\n/g,"\\n").replace(/\r/g,"\\r"); console.log("done"); cb(JSON.parse(xx)); break;
		}
	};
	if(rABS) {
		var val = s2ab(data);
		worker.postMessage(val[1], [val[1]]);
	} else {
		worker.postMessage(data, [data]);
	}
}

function xw(data, cb) {
	transferable = document.getElementsByName("xferable")[0].checked;
	if(transferable) xw_xfer(data, cb);
	else xw_noxfer(data, cb);
}

//监听搜索输入框的enter事件
function enterSearch(e) {
	if(e == 13 || e == 32) {
		search();
	}
}

//根据 名称 搜索
function search() {
	var val = $("#search-val").val();
	if(val == null || val == "") {
		show(getInitialData(), 1, getInitialData().length);
		return ;
	}

	var res = [];
	for(var i = 2 ; i < resultGlobal.length ; i++) {
		if(resultGlobal[i][1].indexOf(val) > -1) {
			addArray(res, i);
		}
	}
	console.log(res);
	show(res, 1, res.length);
}

//根据formate获取当前时间 (eg: "yy-MM-dd hh:mm:ss")
function getFormatDate(formate) {
	var res = formate;
	var time = new Date();

	res = res.replace("yy", time.getFullYear());
	res = res.replace("MM", time.getMonth() + 1);
	res = res.replace("dd", time.getDate());
	res = res.replace("hh", time.getHours());
	res = res.replace("mm", time.getMinutes());
	res = res.replace("ss", time.getSeconds());

	return res;
}

var selectList = [];
//选择指定的行时，checkbox状态变化
function checkboxChanged(selector, index) {
	if($(selector).is(":checked")) {
		if(index == 1) {
			//全选操作，当前页所有checkbox都被选中
			$("#current-table tbody").find("input").each(function(index, item) {
				$(item).prop("checked", true);
				var selected = $(item).parent().find("label:eq(0)").text();
				addArray(selectList, Number(selected));
			});
		} else {
			addArray(selectList, index);
			//如果当前页所有checkbox均被选中，修改批量checkbox状态为选中
			if($("#current-table tbody").find("input").size() == selectList.length) {
				$("#current-table thead").find("input:eq(0)").prop("checked", true);
			}
		}
	} else {
		if(index == 1) {
			//全选操作，当前页所有checkbox都被选中
			$("#current-table tbody").find("input").each(function(index, item) {
				$(item).prop("checked", false);
				var selected = $(item).parent().find("label:eq(0)").text();
				removeArray(selectList, Number(selected));
			});
		} else {
			removeArray(selectList, index);
			//同时将全选checkbox置为false
			$("#current-table thead").find("input:eq(0)").prop("checked", false);
		}
	}

	//修改“导出”后的提示数字
	$("#selected-number").text(selectList.length);
}

//验证arr数组里是否包含数字val
function containInArray(arr, val) {
	for(var i = 0 ; i < arr.length ; i++) {
		if(arr[i] == val) {
			return true;
		}
	}
	return false;
}

//从arr数组中删除val,原来数组顺序会打乱
function removeArray(arr, val) {
  var isExist = false;
  for(var i = 0 ; i < arr.length ; i++) {
	  if(arr[i] == val) {
		  if(i != arr.length) {
			  arr[i] = arr[arr.length - 1];  
		  }
		  isExist = true;
	  }
  }
  if(isExist) {
	  arr.length = arr.length-1;
  }
}

//向数组arr添加val，已经存在就不做任何事
function addArray(arr, val) {
	if(!containInArray(arr, val)) {
		arr.push(val);
	}
}

function downloadSelected() {
	download(selectList);
}

//导出全部数据
function downloadAll() {
	download(getInitialData());
}

function download(selected) {
	var currentTimeFormate = "dd.MM.yy hh:mm:ss";
	var currentTime = getFormatDate(currentTimeFormate);

	var content = ";  EASE 4.0  © ADA\n;\n;  Exported on " + currentTime + "\n;\n;==================================\n;\n\"FileType\",\"Wall Materials\"\n\"Format\",4.0\n\"LengthUnit\",\"m\"\n;";

	for(var i = 0 ; i < selected.length ; i++) {
		var data = resultGlobal[selected[i]];
		var MaterialName = data[1];
		content += "\n\"MaterialName\",\"" + MaterialName + "\"\n";
		content += "\"Description \",\"Totally Sound-Absorbing\"\n";

		content += ";\"Frequency  \"";
		for(var j = 8 ; j < resultGlobal[1].length ; j++) {
			//去掉单位 Hz
			var tmp = resultGlobal[1][j];
			tmp = tmp.substring(0, tmp.length - 2);
			content += ",  " + tmp;
		}
		content += "\n\"Absorption  \"";
		for(var j = 8 ; j < data.length ; j++) {
			content += "," + data[j].trim();
		}
		content += "\n";
	}
	downloadFile("TestWMat.xwm", content);
}

function to_formulae(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var formulae = X.utils.get_formulae(workbook.Sheets[sheetName]);
		if(formulae.length > 0){
			//result.push("SHEET: " + sheetName);
			//result.push("");
			result = formulae;
			//result.push(formulae.join("\n"));
		}
	});
	toTwoDimensionalArray(result);

	//展示数据表格
	$("#starter").hide();
	show(getInitialData(), 1, resultGlobal.length - 2);
	$("#show-table").show();

	return result.join("\n");
}

var resultGlobal = [];
function toTwoDimensionalArray(param) {
	//var result = [];
	var tmp = [];
	var curRow = 1;
	for(var i = 0 ; i < param.length ; i++) {
		var conv = splitSpecStr(param[i]);
		if(curRow != conv[0])  {
			resultGlobal.push(tmp);
			tmp = [];
			curRow = conv[0];
		}
		//去掉换行回车，并将这个单元格的值存放在相应的二维数组中
		tmp[conv[1] - 1] = conv[2].replace(/[\r\n]/g,"");
	}
	resultGlobal.push(tmp);
	console.log("res is ----");
	console.log(resultGlobal);
	return resultGlobal;
}

//datasource : A2='名称
//convert to : [2, 1, "名称"] (第二行，第一列，值)
function splitSpecStr(str) {
	var res = [];
	var pos = str.split("='")[0];
	res.push(Number(pos.substring(1, pos.length)));
	//'A'的Unicode 是65
	res.push(pos.charCodeAt(0) - 64);
	res.push(str.split("='")[1]);
	return res;
}

//展示list指定行数的数据--这里list的行数与xlsx文件中一一对应
function show(list, currentPage, countPerPage) {
	var tHead = "";
	var tContent = "";
	var begin = (currentPage - 1) * countPerPage;
	for(var i = begin ; i < list.length && i < begin + countPerPage ; i++) {
		var tmp = resultGlobal[list[i]];
		tContent += "<tr>";
		for(var j = 0 ; j < tmp.length ; j++) {
			if(j == 0) {
				if(containInArray(selectList, list[i])) {
					tContent += "<td><label class='sr-only'>"+list[i]+"</label><input type='checkbox' onchange='checkboxChanged(this, "+list[i]+");' checked> " + tmp[j] + "</td>";
				} else {
					tContent += "<td><label class='sr-only'>"+list[i]+"</label><input type='checkbox' onchange='checkboxChanged(this, "+list[i]+");'> " + tmp[j] + "</td>";
				}
			} else {
				tContent += "<td>" + tmp[j] + "</td>";
			}
		}
		tContent += "</tr>";
		
	}

//	$("#current-table thead").html(tHead);
	$("#current-table tbody").html(tContent);
} 

function getInitialData() {
	var tmp = [];
	for(var i = 0 ; i < resultGlobal.length - 2 ; i++) {
		tmp[i] = i + 2;
	}
	return tmp;
}

function downloadFile(fileName, content){
    var aLink = document.createElement('a');
    var blob = new Blob([content]);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}

function process_wb(wb) {
	console.log("---");
	console.log(wb);
	var output = to_formulae(wb);
}

var drop = document.getElementById('drop');
function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	var files = e.dataTransfer.files;
	var f = files[0];
	{
		var reader = new FileReader();
		var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var arr = fixdata(data);
			var	wb = X.read(btoa(arr), {type: 'base64'});
	
			process_wb(wb);
		};
		reader.readAsArrayBuffer(f);
	}
}

function handleDragover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

if(drop.addEventListener) {
	drop.addEventListener('dragenter', handleDragover, false);
	drop.addEventListener('dragover', handleDragover, false);
	drop.addEventListener('drop', handleDrop, false);
}


var xlf = document.getElementById('xlf');
var testTmp;
function handleFile(e) {
	var files = e.target.files;
	var f = files[0];
	{
		var reader = new FileReader();
		var name = f.name;
		reader.onload = function(e) {
			var data = e.target.result;
			var arr = fixdata(data);
			var wb = X.read(btoa(arr), {type: 'base64'});
			process_wb(wb);

		};
		reader.readAsArrayBuffer(f);
	}
}

if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);