const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    taskId: {type: String, required: true, unique: true}
});

module.exports = {
    model: mongoose.model('Task', TaskSchema)
}
