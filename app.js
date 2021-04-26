require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const uri = `mongodb+srv://qcaodigital:${process.env.MONGO_PW}@qcaodigital.vys9n.mongodb.net/charred-food?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => console.log('Connected to MongoDb.'));

app.use('/api/menu', require('./routes/menu'));
app.use('/api/contact', require('./routes/contact'));

const port = process.env.PORT || 3001;
app.listen(port, (req, res) => {
	console.log(`Server started on port ${port}`);
});
