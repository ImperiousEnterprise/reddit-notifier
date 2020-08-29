class AppError extends Error{
    constructor(errors) {
        super();
        this.errors = errors;
    }
}
module.exports.AppError = AppError;

module.exports.handleErrors = (err) => {
    let errorList = Object.keys(err).map(e => {
        let er = new Error();
       er.name = e;
       er.message = err[e].message;
       return er;
    });

    return new AppError(errorList);

}
module.exports.handleRedditErrors = (err) => {
    let e = new Error();
    e.name = "Reddit";
    e.message = err.message;
    return new AppError(e);
}