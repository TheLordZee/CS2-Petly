const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");

/** Base attribut class which can be used to make objects for attributes, environments, breeds, and tags tables since they will share the same methods
 * 
 */


class Attribute {
    constructor(tableName){
        this.table = tableName;
    }

    /** Given a name, it will create a new attribute
     * 
     * Returns { name }
     */    
     async create(name){
        name = name.toLowerCase()
        const duplicateCheck = await this.exists(name);
        if(duplicateCheck){
            throw new BadRequestError(`Duplicate ${this.table}: ${name}`)
        }

        const res = await db.query(
            `INSERT INTO ${this.table}s (name)
            VALUES ($1)
            RETURNING id, name`,
            [ name ]
        )

        const attribute = res.rows[0];
        return attribute;
    }


    /** Gets all attributes from the table
     * 
     */
    async getAll(){
        const res = await db.query(
            `SELECT name
            FROM ${this.table}s
            ORDER BY name`
        )
        return res.rows;
    }

    /** Given a name, returns turn or false if it already exists as an attribute
     * 
     */
    async exists(name){
        const res = await db.query(
            `SELECT name
            FROM ${this.table}s
            WHERE name ILIKE $1`,
            [name]
        )
        return (res.rows[0]) ? true : false;
    }

    /** Given a name, returns id if exists
     * 
     */
     async getId(name){
        const res = await db.query(
            `SELECT id
            FROM ${this.table}s
            WHERE name ILIKE $1`,
            [name]
        )
        return res.rows[0];
    }

    /** Given a pet id, returns the attributes of the pet*/
     async getByPetId(petId){
        const res = await db.query(
            `SELECT a.name
            FROM ${this.table}s AS a
            JOIN pet_${this.table}s AS pa
            ON a.id = ${this.table}_id
            WHERE pa.pet_id = $1`,
            [petId]
        )
        const attributes = []

        res.rows.map((r) => {
            attributes.push(r.name)
        })
        
        return attributes;
    }

    /** Given an pet id and attribute id, adds inserts them into the database */
    async addToPet(petId, attributeId){
        const res = await db.query(
            `INSERT INTO pet_${this.table}s (pet_id, ${this.table}_id)
             VALUES ($1, $2)
             RETURNING pet_id, ${this.table}_id`,
            [petId, attributeId]
        )
        return res.rows[0]
    }

    /**Takes an array of attribute names and adds them to the pet */
    async addAllToPet(petId, attributes){
        if(!attributes) throw new BadRequestError("No data!")
        if(attributes.length === 0) return;
        let ids = [];
        for(let a of attributes){
            const id = await this.getId(a);
            if(id){
                if(ids.indexOf(id.id) === -1){
                    ids.push(id.id)
                }
            }else{
                const att = await this.create(a);
                ids.push(att.id)
            } 
        }
        let query = `INSERT INTO pet_${this.table}s (pet_id, ${this.table}_id) VALUES`
        
        for(let i = 0; i < ids.length; i++){
            query += ` (${petId}, ${ids[i]})`;
            if(ids[i+1]){
                query += ','
            }
        }
        try{
        const res = await db.query(
            query, []
        )

        return res.rows[0]
        }catch(e){
            console.log(e)
        }
    }
}

const Tags = new Attribute("tag");
const Breeds = new Attribute("breed");
const Attributes = new Attribute("attribute");
const Environments = new Attribute("environment");

module.exports = {
    Tags,
    Breeds,
    Attributes,
    Environments
}