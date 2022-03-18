const services = {}
const requireDirectory = require('require-directory')
const modules = requireDirectory(module)

for (let item in modules) {
  services[item] = modules[item].default
}

export default services



