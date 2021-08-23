const mongoose = require('mongoose')
const Review = require("./review");
const Schema = mongoose.Schema //creating a reference for shortchut

const CourseSchema = new Schema({
        title: String,
        description: String,
        price: Number,
        images: [
            {
                url: String,
                filename: String
            }
        ],
        coupon: String,
        creator:{
                type: Schema.Types.ObjectId, 
                ref: 'User'
        },
        reviews:[
            {
                type: Schema.Types.ObjectId, 
                ref: "Review"
            }
        ]
    });

CourseSchema.post('findOneAndDelete', async function(doc){
    if(doc)
    {
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Course',CourseSchema)