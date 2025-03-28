import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

export async function POST(req) {  //  Use named export for GET request
   try{
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if(!user){
      return Response.json({ error: "User Not Found!" }, { status: 400 });
    }
    const ispassEqual = await bcrypt.compare(password,user.password);
    
    if(!ispassEqual){
        return res.status(403)
        .json({message:"Incorrect password. Please try again.",success:false});
      }
      if(user.sessionToken !== null){
        return res.status(403)
        .json({message:"user already logged in from other device",success:false});
      }
      const sessionToken = crypto.randomBytes(32).toString("hex");

      user.sessionToken = sessionToken;
      await user.save();

      const jwtToken = jwt.sign(
        {email: user.email,_id: user.id, sessionToken},
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
      )

      res.status(200)
      .json({message: "Login successfully",
        success:true,
        jwtToken,
        email,
        name:user.name
    });

    console.log({message: "Login successfully",
        success:true,
        jwtToken,
        sessionToken,
        email,
        name:user.name
    });

}catch(err){
    res.status(500)
    .json({message:"Login failed",success: false});
}
};
  
