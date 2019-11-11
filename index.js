var fs = require('fs');

/**
	Оборачивает переданную функцию в отложенный объект, передаёт функцию обратного вызова последним аргументом в оборачиваемую функцию
*/
function $promise(func, thisobject){
	return function(){
		var arg = Array.from(arguments);
		return new Promise(function(resolve, reject){
			arg.push(function(err, data){
				if(err){
					reject(err);
				}
				else{
					resolve(data);
				}
			});
			func.apply(thisobject, arg);
		});
	}
}

var appendFile = $promise(fs.appendFile, fs);
var readFile = $promise(fs.readFile, fs);
var writeFile = $promise(fs.writeFile, fs);

function readJSON(path, rev){
	return readFile(path).then(function(data){
		try{
			return JSON.parse(data, rev);
		}
		catch(e){
			console.log(path + ' ' + e);
			throw e;
		}
	});
}

function readJSONRows(path, rev){
	return readFile(path).then(function(buffer){
		var data = buffer.toString('UTF-8');
		return data.split(/[\r\n]+/g).filter((a)=>(a && !/^\s+$/.test(a))).map(function(row){
			try{
				return JSON.parse(row, rev);
			}
			catch(err){
				console.log(err);
				console.log(row);
			}
		});
	});
}

function readJSONArray(path, rev){
	return readFile(path).then(function(data){
		try{
			return JSON.parse(('[' + data).replace(/,[\r\n\s]*$/,'') + ']', rev);
		}
		catch(e){
			console.log(e);
			throw e;
		}
	});	
}

function appendJSON(path, data){
	return appendFile(path, JSON.stringify(data) + ',\r\n');
}

function writeJSON(path, data, a, b){
	return writeFile(path, JSON.stringify(data, a, b));
}

function writeJSONArray(path, data){
	return writeFile(path, data.map((item)=>(JSON.stringify(item)+',\r\n')).join(""));
}

module.exports = {
	readJSON:readJSON,
	writeJSON:writeJSON,
	readJSONArray:readJSONArray,
	appendJSON:appendJSON,
	writeJSONArray:writeJSONArray
};