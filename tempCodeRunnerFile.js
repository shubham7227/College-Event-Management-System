for(i=0;i<events.length;i++){
                    //     connection.query("SELECT * FROM year WHERE ID=?",[events[i].ID],(err,year) =>{
                    //         if(!err){
                    //             for(j=0;j<year.length;j++){
                    //                 if(year[j].years===loggedin_std[0].syear){
                    //                     connection.query("SELECT * FROM branch WHERE ID=?",[events[i].ID],(err,branch) =>{
                    //                         for(l=0;l<year.length;l++){
                    //                             if(branch[l].branch===loggedin_std[0].sbranch){
                    //                                 allevents[k]=connection.query("SELECT ID, ename, poster, DAY(edate) day, DATE_FORMAT(edate,'%b') month FROM events WHERE .ID=?",[events[i].ID],(err, foundevent) => {
                    //                                     if(err){
                    //                                         console.log(err);
                    //                                     }else{
                    //                                         k++;
                    //                                     }
                    //                                 });
                                                        
                    //                             }
                    //                         }
                    //                     });
                    //                 }
                    //             }
                    //         }
                    //     });
                    // }