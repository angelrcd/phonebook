const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
} else if (process.argv.length > 5) {
  console.log('too many arguments');
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://mrangelrcd:${password}@cluster0.hbmvsr2.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)

if (process.argv.length === 3) {
  getAll();
} else {
  const newName = process.argv[3];
  const newPhone = process.argv[4];

  addNew(newName, newPhone)
}

function getAll(){
  Phonebook.find({}).then(result => {
    console.log('Phonebook:');
    result.forEach(person => {
      console.log(`${person.name.padEnd(19)}${person.number}`)
    })
    mongoose.connection.close()
  })

}

function addNew(name, number){
  const newPerson = new Phonebook({
    name, number
  })

  newPerson.save().then(result => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close()
  })
}
