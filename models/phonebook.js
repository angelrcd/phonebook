import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)
  .then(result => console.log('connected to MongoDB'))
  .catch(err => console.log('error connecting to MongoDB', err.message));

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: phone => /^\d{2,3}-\d+$/.test(phone),
      message: props => `${props.value} is not a valid phone number!`
    }
  },
});

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Phonebook', phonebookSchema);