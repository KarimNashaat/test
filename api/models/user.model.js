var mongoose = require('mongoose');

var fileSchema = mongoose.Schema({
  stringValue : String,
  name : String ,
    createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

var userSchema = mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
    trim: true
  },
  LastName: {
    type: String,
    required: true,
    trim: true
  }, 
   email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  files:[fileSchema],


});

// Override the transform function of the schema to delete the password before it returns the object
if (!userSchema.options.toObject) {
  userSchema.options.toObject = {};
}
userSchema.options.toObject.transform = (document, transformedDocument) => {
  delete transformedDocument.password;
  return transformedDocument;
};

mongoose.model('User', userSchema);
mongoose.model('File', fileSchema);
