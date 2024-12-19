const async = require('async');
const mysqldb =	require("mysql");
var connection = mysqldb.createConnection({
    host     : "manage-karix-mysql-service.karix-old-em.svc", 
    user     : "root",      		
    password : "Hd8@se63*21Y2",  	
    database : "manage",   
});

// async function update_esme(req, res, next, arr) {
async function update_esme() {

    try{
    // mysqlPool.getConnection( async function(err, connection){
    connection.connect(async function(err){
    //     // console.log("connection =",connection);
        if(err){
            console.log("error =",`Connection Failed ${err}`);
            return;
        }

        await getexceldata().then((result)=>{

            if(typeof result !== 'undefined' && result.length !== 0){

                console.log("Excel data :",result);
                let i=1;
                let u=0;
                let nu=0;

                async.forEachLimit(result, 1, async (row, next)=>{
                // result.forEach( async function(row) {
                    i++;
                    // console.log(row);
                    var params = {};
                    let isvalue = false;

                   
                    if(row.ESME !== null && row.ESME !== ''  && row.ESME!==undefined) {
                        params.ESME = row.ESME;
                        isvalue = true;

                    }  
                    
                    console.log("params",row.User_Id , params);
                    if(isvalue) {
                        // var rows_ms = await updateuser(params,row.User_Id).then((rows_ms)=>{
                            
                        //     if(rows_ms>0){
                        //         u++;
                        //         console.log(row.User_Id+' User updated Successfully!');
                        //         return next;
                        //     } else {
                        //         console.log(row.User_Id+' User not updated!');
                        //         nu++;
                        //         return next;
                        //     }
                        // }).catch((err)=>{
                        //     nu++;
                        //     console.log('Error on update userid : '+  row.User_Id + err);
                        //     return next;
                        // })  
                    } else {
                        nu++;
                        console.log('Error on update userid : '+  row.User_Id);
                        return next;
                    }

                }, (err)=>{

                    if(err) {
                        console.log('Error on loop:' + err);
                    } else {
                        
                        console.log("Total users = ",i);
                        console.log("Total updated users = ",u);
                        console.log("Total not update users = ",nu);
                        var data = {
                            totalusers: i,
                            totalupdatedusers: u,
                            totalnotupdateusers: nu
                        };
                        console.log('esme final result=',JSON.stringify(data));
                        // res.write(JSON.stringify(data));
                        // res.end(); 
                        return;
                    }
                });
                
            }else{
                console.log('excel data not found!');
                // return res.status(400).json({ success:false, msg:`excel data not found!`});
            }
            
        }).catch((err)=>{
            console.log('Error on read excel data:' + err);
            // return res.status(400).json({ success:false, msg:`Error on read excel: ${err}`});
        })
        
    });
} catch (err){
    console.log('Error on update user id : '+ err);
}
}

async function getexceldata (){
    return new Promise((resolve, reject)=>{

        try {

            var XLSX = require('xlsx');
            var workbook = XLSX.readFile('/usr/lib/sarv_modules/sendclean_api/esme/Karix All username List.xlsx');
            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function(y) {
                var worksheet = workbook.Sheets[y];
                var headers = {};
                var data = [];
                for(z in worksheet) {
                    if(z[0] === '!') continue;
                    //parse out the column, row, and value
                    var tt = 0;
                    for (var i = 0; i < z.length; i++) {
                        if (!isNaN(z[i])) {
                            tt = i;
                            break;
                        }
                    };
                    var col = z.substring(0,tt);
                    var row = parseInt(z.substring(tt));
                    var value = worksheet[z].v;

                    //store header names
                    if(row == 1 && value) {
                        headers[col] = value;
                        continue;
                    }

                    if(!data[row]) data[row]={};
                    data[row][headers[col]] = value;
                }
                //drop those first two rows which are empty
                data.shift();
                data.shift();
                // console.log(data);
                return resolve(data);
            });
        } catch (error) {
            console.error(error);
            return reject(error);
        }
    })
}

async function updateuser (params,user_id){
    return new Promise((resolve, reject)=>{
        const updateQuery = 'UPDATE users SET ? WHERE user_id = ? ';
        connection.query(updateQuery, [params, user_id], function(err, result, fields) {

            if(err) {
                console.log('Error on update user:' + err);
                return reject(err);
            } else {
            
                return resolve(result.affectedRows);
            }
        });
    })
}

update_esme();
