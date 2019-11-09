'use strict';

const _ = require('lodash');

function paginate() {
    return async (ctx,next)=>{
        let {limit, offset} = ctx.query;


        limit = _.toNumber(limit);
        offset = _.toNumber(offset);

        const max= 100;
        const min= 4;

        const filteredLimit= limit>= min && limit <=max ? limit:min;
        const filteredOffset = offset >=0 ? offset : 0;

        ctx.paginate={limit:filteredLimit,offset:filteredOffset};

        await next()
    }
}


module.exports=paginate;
