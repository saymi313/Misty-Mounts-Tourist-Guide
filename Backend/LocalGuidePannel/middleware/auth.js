// Legacy imports share the active authentication policy.
module.exports = { authenticateUser: require('../../middleware/auth').authenticate };
