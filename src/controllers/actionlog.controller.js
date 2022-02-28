const db = require('../database');

exports.firstCodeState = (req, res) => {
    const taskId = req.query.taskId;
    const userId = req.query.userId;
    if (!taskId || ! userId) {
        res.status(400).send('Invalid params');
        return;
    }
    db.getFirstActionlog(taskId, userId)
        .then(actionlog => {
            if (!actionlog) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send({actionlog: actionlog})
        })
        .catch(err => {
            res.status(500).send({ message: err });
        })
};

exports.lastCodeState = (req, res) => {
    const taskId = req.query.taskId;
    const userId = req.query.userId;
    if (!taskId || ! userId) {
        res.status(400).send('Invalid params');
        return;
    }
    db.getLastActionlog(taskId, userId)
        .then(actionlog => {
            if (!actionlog) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send({actionlog: actionlog})
        })
        .catch(err => {
            res.status(500).send({ message: err });
        })
};

exports.nextCodeState = (req, res) => {
    const taskId = req.query.taskId;
    const userId = req.query.userId;
    const timestamp = req.query.timestamp;
    if (!taskId || ! userId || !timestamp) {
        res.status(400).send('Invalid params');
        return;
    }
    db.getNextActionlog(taskId, userId, timestamp)
        .then(actionlog => {
            if (!actionlog) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send({actionlog: actionlog})
        })
        .catch(err => {
            res.status(500).send({ message: err });
        })
};

exports.previousCodeState = (req, res) => {
    const taskId = req.query.taskId;
    const userId = req.query.userId;
    const timestamp = req.query.timestamp;
    if (!taskId || ! userId || !timestamp) {
        res.status(400).send('Invalid params');
        return;
    }
    db.getPreviousActionlog(taskId, userId, timestamp)
        .then(actionlog => {
            if (!actionlog) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send({actionlog: actionlog})
        })
        .catch(err => {
            res.status(500).send({ message: err });
        })
};
