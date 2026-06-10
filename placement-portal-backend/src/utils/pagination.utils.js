
const getPagination=(query)=>{
    let page=parseItne(query.page,10)||1;
    let limit=parseInt(query.limit,10)||10;


      if (page  < 1)   page  = 1;
  if (limit < 1)   limit = 1;
  if (limit > 100) limit = 100;
}