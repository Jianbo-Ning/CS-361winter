const requireDirectory = require('require-directory')
const modules = requireDirectory(module)
const models = {}
for (let item in modules) {
  models[item] = modules[item].default
}

export default models
