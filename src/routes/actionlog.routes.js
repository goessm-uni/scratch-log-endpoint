const controller = require("../controllers/actionlog.controller");
const hasSecretToken = require("../middlewares/authSecret");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Authorization"
        );
        next();
    });
    app.get("/actionlog/first", [hasSecretToken], controller.firstCodeState);
    app.get("/actionlog/last", [hasSecretToken], controller.lastCodeState);
    app.get("/actionlog/next", [hasSecretToken], controller.nextCodeState);
    app.get("/actionlog/previous", [hasSecretToken], controller.previousCodeState);
};
