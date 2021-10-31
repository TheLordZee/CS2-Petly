const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");

/** Base attribut class which can be used to make objects for attributes, environments, breeds, and tags tables since they will share the same methods
 * 
 */

const db = require("../db");

class Attribute {
    constructor(tableName){
        this.table = tableName;
    }

    /** Given a name, it will create a new attribute
     * 
     * Returns { name }
     */    
    static async create(name){
        name = name.toLowerCase()
        const duplicateCheck = await db.query(
            `SELECT name
            FROM ${this.table}
            WHERE name = $2`,
            [ name ]
        )

        if(duplicateCheck.rows[0]){
            throw new BadRequestError(`Duplicate ${this.table}: ${name}`)
        }

        const res = await db.query(
            `INSERT INTO ${this.table} (name)
            VALUES ($1)
            RETURNING name`,
            [ name ]
        )

        const attribute = res.rows[0];
        return attribute;
    }


    /** Gets all attributes from the table
     * 
     */
    static async getAll(){
        const res = await db.query(
            `SELECT name
            FROM ${this.table}
            ORDER BY name`
        )

        return res.rows;
    }

    /** Given a name, returns turn or false if it already exists as an attribute
     * 
     */
    static async exists(name){
        const res = await db.query(
            `SELECT name
            FROM ${this.table}
            WHERE name = $1`,
            [name]
        )

        return (res.rows[0]) ? true : false;
    }

    /** Given a pet id, returns the attributes of the pet*/
    static async getByPetId(petId){
        const res = await db.query(
            `SELECT a.name
            FROM ${this.table} a
            JOIN pet_${this.table} pa
            WHERE pa.pet_id = $1`,
            [petId]
        )
        const attributes = []

        res.rows.map((r) => {
            attributes.push(r.name)
        })
        
        return attributes;
    }
}

const Tags = new Attribute("tags");
const Breeds = new Attribute("breeds");
const Attributes = new Attribute("attributes");
const Environments = new Attribute("environments");

module.exports = {
    Tags,
    Breeds,
    Attributes,
    Environments
}