const express = require("express");
const path = require("path");
const bcrypt=require("path")

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.post("/register",async(request,response)=>{
  const {username,name,password,gender,location}=request.body;
  const hashedPassword=await bcrypt(password,10)
  const selectUserQuery=`
  SELECT * user
  WHERE username='${username}';
  `;
  const dbUser=await db.get(selectUserQuery)
  if (dbUser===undefined){
    const addUser=`
    INSERT INTO user(id,username,user,password,gender,location)
    VALUES(
        ${id},
        '${username}',
        '${user}',
        '${password}',
        '${gender}',
        '${location}'

    );
    `;
    
    if (password.length<5){
      response.status(400);
      response.send("Password is too short");
    }
    else{
      const response=await db.run(addUser)
      response.status(200);
      response.send("User created successfully");
    }
    

  }
  else{
    response.status(400);
    response.send("User already exists");
  }

})


app.post("/login",async(request,response)=>{
  const {username,password}=request.body
  const hashedPassword=await bcrypt(password,10)
  const selectUserQuery=`
  SELECT * user
  WHERE username='${username}';
  `;
  const dbUser=await db.get(selectUserQuery)
  if (dbUser===undefined){
    response.status(400)
    response.send("Invalid user")
  }
  else{
    const isPasswordMatched=await bcrypt.compare(password,dbUser.password)
    if (isPasswordMatched===true){
      response.status(200)
      response.send("Login Success!")
    }
    else{
      response.status(400)
    response.send("Invalid password")
    }
  }
  
})


app.put("/change-password",async(request,response)=>{
  const {username,oldPassword,newPassword}=request.body
  const selectUserQuery=`
  SELECT * user
  WHERE username='${username}';
  `;
  const dbUser=await db.get(selectUserQuery)
  if (dbUser===undefined){
    response.status(400)
    response.send("User not registered")
  }
  else{
    const isValidPass=await bcrypt.compare(oldPassword,dbUser.password)
    if (isValidPass===true){
        if (newPassword.length<5){
          response.status(400)
          response.send("Password is too short")
        }
        else{
          const encryptedPassword=await bcrypt.hash(newPassword,10)
          const updateQuery=`
          UPDATE user 
          set password='${encryptedPassword}'
          WHERE username='${username}';
          `;
          await db.run(updateQuery)
          response.send("Password updated")
        }

    }
    else{
      response.status(400)
      response.send("Invalid current password ")
    }
  }


})
module.exports=app