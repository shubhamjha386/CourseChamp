const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/courses', 
{useNewUrlParser: true,
 useUnifiedTopology: true,
 useCreateIndex: true
})
.then(()=>{
    console.log("Connected to database");
})
.catch(err=>{
    console.log("Error occured");
    console.log(err);
})
const Course = require('../models/courses');
const Data = require('./data');
const seedDB = async ()=>{
    await Course.deleteMany({});
   for(let i=0;i<100;i++)
   {
     const c=new Course({
           title: Data[i].title,
           description: Data[i].description,
           price: Data[i].price,
           coupon: Data[i].coupon,
           creator: '60eecfb32a618221a0ed4ada',
           images: [
            {
                url: 'https://res.cloudinary.com/dbtiwkn4p/image/upload/v1626710351/Courses/eaod8tvadvpqrsxcegtv.jpg',
                filename: 'Courses/eaod8tvadvpqrsxcegtv'},
            {
                url: 'https://res.cloudinary.com/dbtiwkn4p/image/upload/v1626710351/Courses/eaod8tvadvpqrsxcegtv.jpg',
                filename: 'Courses/eaod8tvadvpqrsxcegtv'
            }
           ]
       });
       await c.save();
   }
}
seedDB();