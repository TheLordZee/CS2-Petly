const {ExpressError} = require("../expressError")

function makeFilterQuery(filter){
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    let query = "";
    let vals = [];

    if(keys.length === 0){
        return query;
    }

    for(let key of keys){
        query += `JOIN pet_${key}s ON pet_${key}s.pet_id = p.id JOIN ${key}s ON ${key}s.id = pet_${key}s.${key}_id`
    }

    query += " WHERE "
    let valCount = 1;
    for(let i = 0; i < keys.length; i++){
        let res = '';
        if(keys[i-1] !== undefined && filter[keys[i]].length > 0){
            res = " OR "
        }

        switch(keys[i]){
            case "breed":
                for(let j = 0; j < filter.breed.length; j++){
                    if(filter.breed[j-1] !== undefined){
                        res += " OR "
                    }
                    res += `breeds.name ILIKE $${valCount}`
                    vals.push(`%${filter.breed[j]}%`)
                    valCount++;
                }
                break;
            case "tag":
                for(let j = 0; j < filter.tag.length; j++){
                    if(filter.tag[j-1] !== undefined){
                        res += " OR "
                    }
                    res += `tags.name ILIKE $${valCount}`
                    vals.push(`%${filter.tag[j]}%`)
                    valCount++
                }
                break;
            case "environment":
                for(let j = 0; j < filter.environment.length; j++){
                    if(filter.environment[j-1] !== undefined){
                        res += " OR "
                    }
                    res += `environments.name ILIKE $${valCount}`
                    vals.push(`%${filter.environment[j]}%`)
                    valCount++;
                }
                break;
            case "attribute":
                for(let j = 0; j < filter.attribute.length; j++){
                    if(filter.attribute[j-1] !== undefined){
                        res += " OR "
                    }
                    res += `attributes.name ILIKE $${valCount}`
                    vals.push(`%${filter.attribute[j]}%`)
                    valCount++;
                }
                break;
            default:
                throw new ExpressError(`Invalid filter: ${keys[i]}}`)
        }

        query += res;
    }

    return {query, vals}
}

module.exports = makeFilterQuery;