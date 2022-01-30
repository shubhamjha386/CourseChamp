const Course = require("./models/courses");
module.exports.isloggedin = (req,res,next)=>{

    if(!req.isAuthenticated())
    {
      req.session.returnto = req.originalUrl;
    req.flash('error',"You must be signed in");
    return res.redirect('/login');
    }
  next();
}

module.exports.isCreator = async (req,res,next)=>{
  const { id } = req.params;
  const course = await Course.findById(id);
  if(!req.user._id || !course.creator.equals(req.user._id))
  {
    req.flash('error', `You don't have permission to do that`);
    return res.redirect(`/courses/${id}`)
  }
  next();
}
