var config = {}
config.server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
config.server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
config.client_port = 8000
config.path = ''
config.host = config.server_ip_address + ":" + config.server_port + config.path;

module.exports = config;
