function validate(schema, source = "body") {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(req[source]);

            if (
                req[source] &&
                typeof req[source] === "object" &&
                !Array.isArray(req[source]) &&
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
            ) {
                Object.keys(req[source]).forEach((key) => {
                    delete req[source][key];
                });
                Object.assign(req[source], parsed);
            } else {
                req[source] = parsed;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = validate;
