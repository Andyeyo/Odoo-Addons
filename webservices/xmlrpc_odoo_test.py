import functools
import xmlrpclib
HOST = 'localhost'
PORT = 8069
DB = 'Miviltech'
USER = 'admin'
PASS = 'admin'
ROOT = 'http://%s:%d/xmlrpc/' % (HOST, PORT)

# 1. Login
uid = xmlrpclib.ServerProxy(ROOT + 'common').login(DB, USER, PASS)
print "Logged in as %s (uid:%d)" % (USER, uid)


call = functools.partial(
    xmlrpclib.ServerProxy(ROOT + 'object').execute,
    DB, uid, PASS)

# 2. Read the sessions (modelo, metodo, dominio, columnas o campos)
services = call('cc.service','search_read', [], ['name', 'sub_route_id','bus_stops_total'])  # [] se manda vacio y es el dominio
for service in services:
    print "Session %s (%s seats) %s" % (service['name'], service['sub_route_id'],service['bus_stops_total'])

# 3. Create a new session
# session_id = call('openacademy.session', 'create', {
#     'name': 'My session',
#     'course_id': 2,
# })
