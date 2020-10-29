const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Sequelize = require('sequelize');

const sequelize = new Sequelize('students2', 'me', 'password', {
  host: 'localhost',
  dialect: 'postgres',
    define: {
        timestamps: false
    }
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const Student = sequelize.define("student", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        groupId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updated_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        }
    }
);

const Group = sequelize.define("group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Group.hasMany(Student, { onDelete: "cascade" });

//sequelize.sync().then(result=>{
//    console.log("Synchronization")
//})
  //  .catch(err=> console.error("Error synchronization" + err))

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(201).send("Created");
});

app.get("/students", (req, res) => {
    Student.findAll({raw:true}).then(student=>{
        res.send(student)
    }).catch(err=>console.error(err))
})

app.get("/students/:id", async (req, res) => {
    try {
        const {id} = req.params
        const student = await Student.findOne({where: { id: id}})
        student ? res.status(200).send(student):res.sendStatus(404)
    } catch (err){
        res.status(400).send(err)
    }
})

app.post("/students", async (req, res) => {
    try {
        const {firstName, lastName, groupId} = req.body
        const group = await Group.findByPk(groupId)
        if (group){
            await group.createStudent({firstName: firstName, lastName: lastName})
            res.sendStatus(201)
        }else
            res.sendStatus(404)
    } catch (err){
        res.status(400).send(err)
    }
})

app.put("/students/:id", async(req,res) =>{
    try {
        const {id} = req.params
        const {firstName,lastName,groupId} = req.body
        if(await Student.findByPk(id)) {
            if(firstName && lastName && groupId){
                if(!await Group.findByPk(groupId)) res.status(404).send("Group not found")
                await Student.update(
                    {
                        firstName: firstName,
                        lastName: lastName,
                        groupId: groupId
                    },  {
                        where: { id: id }
                    }
                )
                res.status(200).send("Updated!")
            }
            else{
                if(firstName){
                    await Student.update(
                        {
                            firstName: firstName
                        },  {
                            where: { id: id }
                        }
                    )
                }
                if(lastName){
                    await Student.update(
                        {
                            lastName: lastName
                        },  {
                            where: { id: id }
                        }
                    )
                }
                if(groupId){
                    if(!await Group.findByPk(groupId)) res.status(404).send("Group not found")
                    await Student.update(
                        {
                            groupId: groupId
                        },  {
                            where: { id: id }
                        }
                    )
                }
                res.status(200).send("Updated!")
            }
        } else {
            res.sendStatus(404)
        }
    } catch (err){
        res.status(400).send(err)
    }
})

app.delete("/students/:id", async (req,res) => {
    try {
        const {id} = req.params
        const result = await Student.destroy({ where: { id: id }})
        result ? res.sendStatus(200):res.sendStatus(404)
    } catch (err){
        res.status(400).send(err)
    }
})

app.get("/groups", async (req, res) => {
    try {
        const groups = await Group.findAll({ include: Student })
        res.send(groups)
    } catch (err){
        res.status(400).send(err)
    }
})

app.get("/groups/:id", async (req, res) => {
    try {
        const {id} = req.params
        const group = await Group.findByPk(id,{ include: Student })
        group ? res.status(200).send(group):res.sendStatus(404)
    } catch (err){
        res.status(400).send(err)
    }
})

app.post("/groups", async (req, res) => {
    try {
        const {name} = req.body
        console.log(name)
        const result = await Group.create({ name: name })
        res.status(201).send(result)
    } catch (err){
        res.status(400).send(err)
    }
})

app.delete("/groups/:id", async (req,res) => {
    try {
        const {id} = req.params
        const result = await Group.destroy({ where: { id: id }})
        result ? res.sendStatus(200):res.sendStatus(404)
    } catch (err){
        res.status(400).send(err)
    }
})


app.listen(8080, () => {
  console.log("Server up");
});
