const useQueryParser = (req) => {
    const [path, query] = req.url.split('?')
    req.path = path
    req.query = {}

    if (query) {
        query
            .split('&')
            .map(param => param.split('='))
            .forEach(([key, value]) => {
                if (!isNaN(value * 1)) {
                    req.query[key] = value * 1
                } else if (value === 'true') {
                    req.query[key] = true
                } else if (value === 'false') {
                    req.query[key] = false
                } else {
                    req.query[key] = value
                }
            })
    }
}

module.exports = useQueryParser