const { BadRequestError } = require("../expressError");


function sqlForPartialUpdate(data, jsToSql){
    const keys = Object.keys(data);
    if(keys.length === 0) throw new BadRequestError("No data");

    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(data)
    };
}

module.exports = { sqlForPartialUpdate }