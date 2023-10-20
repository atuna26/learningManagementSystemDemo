const express = require("express");
const router = express.Router();
const User = require("../models/User");

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if(user){
    const userData ={
      userName:user.userName,
      role:user.role,
    }
    req.userData=userData
  }
  next();
 
}

router.use(LoadRoleInfo);


router.get("/", async (req, res) => {
  const numberTea = (await User.find({role:"Teacher"})).length
  const numberStu = (await User.find({role:"Student"})).length
  res.render("site/index",{userData:req.userData,numberTea,numberStu});
});
router.get("/dashboard",(req, res) => {
  res.redirect("/")
});


module.exports = router;
