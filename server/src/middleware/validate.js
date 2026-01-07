/**
 * Middleware de validation — wrapper autour d'express-validator.
 *
 * Prend un tableau de validations, les execute sequentiellement
 * (short-circuit a la premiere erreur), puis formate les erreurs
 * en un objet { field, message } lisible par le front.
 *
 * Usage dans les routes :
 *   router.post('/products', validate(productRules), createProduct);
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = validations => {
    return async (req, _res, next) => {
        // Execution sequentielle : on s'arrete des la premiere erreur
        // pour eviter des messages confus (ex: "email invalide" + "email requis").
        for (const validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
        }));

        next(ApiError.badRequest('Donnees invalides', extractedErrors));
    };
};

module.exports = validate;
