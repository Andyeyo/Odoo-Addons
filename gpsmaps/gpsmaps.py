import xml, commands, string
from odoo import api, fields, models, http
from odoo.http import request
from datetime import date, timedelta


class snippet_positions_controller(http.Controller):

    @http.route(['/snippet_positions/render'], type='json', auth='public', website=True)

    def render_positions(self, data):
        positions_obj = request.env['gpsmaps.positions']

        vals = {}
        vals['address'] = data['address']
        positions_rec = positions_obj.search([('id', '=', data['id'])])
        positions_rec.write(vals)


class positions(models.Model):
    _name = "gpsmaps.positions"
    _pointOnVertex = ""

    def read_group(self, domain, fields, groupby, offset=0, limit=None, context=None, orderby=False, lazy=True):
        if context is None:
            context = {}
        user = self.env['res.users'].browse(self, context=context)
        if user.company_id.id != 1:
            domain += [['device_id.company_id', '=', user.company_id.id]]
        return super(positions, self).read_group(self, domain, fields, groupby, offset=0, limit=None, context=None,
                                                 orderby=False, lazy=True)

    def search(self, args, offset=0, limit=None, order=None, context=None, count=False):
        # print "SEARCH positions ------------------------------ "
        campo = ['CAMPONUEVO', '=', 'JS']
        if context is None:
            context = {}
        user = self.env['res.users'].browse(self, context=context)
        if len(args) > 0:
            if campo == args[0]:
                # self.method(self, 1)
                args = args[1:]
        if user.company_id.id != 1:
            args += [['device_id.company_id', '=', user.company_id.id]]
        # print 'SEARCH :: DES FIELDS=',args
        # self.method(self)
        return super(positions, self).search(self, args, offset, limit, order, context=context, count=count)

    """    
    def write(self, self, ids, vals, context=None):
        if context is None:
            context = {}
        print "WRITE positions ------------------------------ "
        #self.method(self)
        #def method(self,self):    
        return super(positions, self).write(self, ids, vals, context=context)  
    """

    def pre_borrado(self):
        vehicle_obj = self.env['fleet.vehicle']
        positions_obj = self.env['gpsmaps.positions']

        args_vehicle = []
        vehicle_ids = vehicle_obj.search(self, args_vehicle)
        vehicle_datas = vehicle_obj.browse(self, vehicle_ids)

        if len(vehicle_datas) > 0:
            polygons = []
            for data in vehicle_datas:
                vehicle_id = data.id
                vehicle_history = data.history

                if not (vehicle_history > 0):
                    vehicle_history = 32
                date_history = '%s 00:00:00' % (date.today() - timedelta(days=vehicle_history))

                args_positions = [['times', '<', date_history]]
                positions_ids = positions_obj.search(self, args_positions)
                positions_obj.unlink(self, positions_ids, context=None)

    def pointInPolygon(self, point, polygon, pointOnVertex=True):
        _pointOnVertex = pointOnVertex
        point = self.pointStringToCoordinates(self, point)

        vertices = []
        for vertex in polygon:
            vertices.append(self.pointStringToCoordinates(self, vertex))

        intersections = 0
        for i in range(len(vertices)):

            vertex1 = vertices[i - 1]
            vertex2 = vertices[i]
            if float(vertex1['y']) == float(vertex2['y']) and float(vertex1['y']) == float(point['y']) and float(
                    point['x']) > min(float(vertex1['x']), float(vertex2['x'])) and float(point['x']) < max(
                    float(vertex1['x']), float(vertex2['x'])):
                return 'BORDE'

            if float(point['y']) > min(float(vertex1['y']), float(vertex2['y'])) and float(point['y']) <= max(
                    float(vertex1['y']), float(vertex2['y'])) and float(point['x']) <= max(float(vertex1['x']), float(
                    vertex2['x'])) and float(vertex1['y']) != float(vertex2['y']):
                xinters = (float(point['y']) - float(vertex1['y'])) * (float(vertex2['x']) - float(vertex1['x'])) / (
                            float(vertex2['y']) - float(vertex1['y'])) + float(vertex1['x'])
                if xinters == float(point['x']):
                    return 'BORDE'
                if float(vertex1['x']) == float(vertex2['x']) or float(point['x']) <= float(xinters):
                    intersections = intersections + 1

        if intersections % 2 != 0:
            return 'IN'
        else:
            return 'OUT'

    def pointStringToCoordinates(self, point):
        coordinates = string.split(point, ' ')
        coordinate = {}
        coordinate['x'] = coordinates[0]
        coordinate['y'] = coordinates[1]
        return coordinate

    def node(self, node, vals, xmldoc):
        if xmldoc.getElementsByTagName(node):
            vals[node] = xmldoc.getElementsByTagName(node)[0].firstChild.data
            vals['other'] = self.clean_xml(self, node, vals['other'])
        return vals

    def clean_xml(self, string, xml):
        string_ini = str('<%s>' % (string))
        string_fin = '</%s>' % (string)
        pos_ini = xml.index(string_ini)
        pos_fin = xml.index(string_fin) + len(string_fin)

        ini = xml[:pos_ini]
        fin = xml[pos_fin:]

        string_end = '%s%s' % (ini, fin)
        # print string,'=',string_end
        return str(string_end)

    def method(self):
        # print "METHOD--------"
        """
        args_positions  =[['times', '=', False]]
        ids_positions   =super(positions, self).search(self, 1, args_positions,0,200)
        """
        args_positions = [['times', '=', False]]
        # ids_positions   =super(positions, self).search(self, 1, args_positions,0,200)
        ids_positions = super(positions, self).search(self, 1, args_positions, 0, 200)
        # ids_positions   =super(positions, self).search(self, 1, args_positions,0,1)
        # ids_positions   = super(positions, self).search(self, 1,[],0,10)

        positions_obj = self.env['gpsmaps.positions']
        events_obj = self.env['gpsmaps.events']
        geofence_obj = self.env['gpsmaps.geofence']
        protocol_obj = self.env['gpsmaps.protocol']
        mail_obj = self.env['mail.mail']
        vehicle_obj = self.env['fleet.vehicle']

        args_geofence = []
        geofence_ids = geofence_obj.search(self, args_geofence)

        # print 'geofence_ids=',geofence_ids
        geofence_datas = geofence_obj.browse(self, geofence_ids)

        if len(geofence_datas) > 0:
            polygons = []
            for data in geofence_datas:
                # print 'DATA=', data.company_id.id
                geofence_id = data.id
                geofence = data.geofence
                points = data.points
                in_geofence_mail = data.in_geofence_mail
                out_geofence_mail = data.out_geofence_mail

                coordinates = string.split(data.points, ';')
                polygon = []
                for coordinate in coordinates:
                    polygon.append(coordinate.replace(",", " "))
                polygons.append([geofence_id, polygon, in_geofence_mail, out_geofence_mail, data.company_id.id])

        datas = positions_obj.browse(self, 1, ids_positions)
        if len(datas) > 0:
            for data in datas:
                vals = {}

                datas_vehicle = vehicle_obj.browse(self, 1, data.device_id.id)

                if data.date:
                    vals['date'] = data.date
                if data.other:
                    vals['other'] = data.other

                for key in vals.keys():
                    if key == 'other':
                        document = vals['other']
                        xmldoc = xml.dom.minidom.parseString(document)

                        # print commands.getstatusoutput('ls')

                        vals = self.node(self, 'hdop', vals, xmldoc)
                        vals = self.node(self, 'milage', vals, xmldoc)
                        vals = self.node(self, 'state', vals, xmldoc)
                        vals = self.node(self, 'battery', vals, xmldoc)
                        vals = self.node(self, 'power', vals, xmldoc)
                        vals = self.node(self, 'gsm', vals, xmldoc)
                        vals = self.node(self, 'satellites', vals, xmldoc)
                        # vals=self.node(self,'protocol',vals,xmldoc)
                        # vals=self.node(self,'event',vals,xmldoc)

                        node = 'milage'
                        if xmldoc.getElementsByTagName(node):
                            vals[node] = int(xmldoc.getElementsByTagName(node)[0].firstChild.data) / 1000
                        node = 'protocol'
                        if xmldoc.getElementsByTagName(node):
                            # vals=self.node(self,'hdop',vals,xmldoc)
                            vals[node] = xmldoc.getElementsByTagName(node)[0].firstChild.data
                            vals['other'] = self.clean_xml(self, node, vals['other'])
                            args_events = [['protocol_id.protocol', '=', vals[node]]]

                            if len(events_obj.search(self, 1, args_events)) > 0:
                                vals['event_id'] = events_obj.search(self, 1, args_events)[0]

                            protocol_name = vals[node]
                            # protocol_name='meitrack'
                            # print "PROTOCOL:",protocol_name

                            args_protocol = [['protocol', '=', protocol_name]]
                            # print "filtro PROTOCOL:",args_protocol
                            protocol_id = protocol_obj.search(self, 1, args_protocol)
                            # print "PROTOCOL ID:",protocol_id

                            datas_protocol = protocol_obj.browse(self, 1, protocol_id)[0]

                            # print "PROTOCOL DATA",datas_protocol.speed

                            if datas_protocol.speed:
                                vals['speed'] = datas_protocol.speed * data.speed
                                # data.speed=datas_protocol.speed*data.speed
                                # print "PROTOCOL speed", vals['speed']

                        node = 'event'
                        if xmldoc.getElementsByTagName(node):
                            # vals=self.node(self,'hdop',vals,xmldoc)
                            vals[node] = xmldoc.getElementsByTagName(node)[0].firstChild.data
                            vals['other'] = self.clean_xml(self, node, vals['other'])
                            args_events = [
                                ['code', '=', vals[node]],
                                ['protocol_id.protocol', '=', vals['protocol']]
                            ]
                            if len(events_obj.search(self, 1, args_events)) > 0:
                                vals['event_id'] = events_obj.search(self, 1, args_events)[0]
                                datas_events = events_obj.browse(self, 1, vals['event_id'])
                                # print "datas_events====", datas_events[0].standar_id.code

                        if len(vals['other']) == 13:
                            vals['other'] = ''

                    if key == 'date':
                        fieldtimes = vals['date']
                        year = fieldtimes[:4]
                        month = fieldtimes[5:7]
                        day = fieldtimes[8:10]
                        hour = fieldtimes[11:13]
                        minute = fieldtimes[14:16]
                        second = fieldtimes[17:19]
                        vals['times'] = '%s-%s-%s %s:%s:%s' % (year, month, day, hour, minute, second)
                        vals['date'] = ''

                        point = '%s %s' % (data.latitude, data.longitude)

                        if len(polygons) > 0:
                            for polygon in polygons:
                                # polygon[4]
                                # print "datas_vehicle:",datas_vehicle.company_id.id

                                if datas_vehicle.company_id.id == polygon[4]:
                                    status_geofence = self.pointInPolygon(self, point, polygon[1])
                                    send_email = 0
                                    send_email = 1
                                    vals_email = {}
                                    vals_vehicle = {}

                                    for data_vehicle in datas_vehicle:

                                        # send_email                  =1
                                        # vals_email['body_html']     ='Entro a la geocerca %s' %(data_vehicle.geofence_id.name)
                                        model = data_vehicle.model_id.name
                                        plate = data_vehicle.license_plate
                                        driver = data_vehicle.driver_id.name
                                        odometer = data_vehicle.odometer
                                        speed = data.speed

                                        html_model = ''
                                        if model != False:
                                            html_model = '<tr><td width="100"><b>Vehicle</b></td><td> %s </td></tr>' % (
                                                model)
                                        html_plate = ''
                                        if plate != False:
                                            html_plate = '<tr><td><b>Plate</b></td><td> %s </td></tr>' % (plate)
                                        html_driver = ''
                                        if driver != False:
                                            html_driver = '<tr><td><b>Driver</b></td><td> %s </td></tr>' % (driver)
                                        html_odometer = ''
                                        if odometer != False:
                                            html_odometer = '<tr><td><b>Odometer</b></td><td> %s </td></tr>' % (
                                                odometer)
                                        html_speed = ''
                                        if speed != False:
                                            html_speed = '<tr><td><b>Speed</b></td><td> %s </td></tr>' % (speed)
                                        html_geofence = ''
                                        if geofence != False:
                                            html_geofence = '<tr><td><b>Geofence</b></td><td> %s </td></tr>' % (
                                                geofence)

                                        html_date = '<tr><td><b>Date</b></td><td> %s </td></tr>' % (vals['times'])
                                        html_geofence = ''

                                        rute_street = 'http://maps.googleapis.com/maps/api/streetview?size=500x250&location='
                                        rute_street = '%s%s,%s' % (rute_street, data.latitude, data.longitude)
                                        img_street = '<img border="0" alt="Street View" src="//maps.googleapis.com/maps/api/streetview?size=600x300&location='
                                        img_street = '%s%s,%s">' % (img_street, data.latitude, data.longitude)
                                        url_street = '<a href="%s">%s</a>' % (rute_street, img_street)

                                        rute_map = 'http://maps.googleapis.com/maps/api/staticmap?zoom=16&size=500x250&maptype=roadmap&markers=color:red%7C'
                                        rute_map = '%s%s,%s' % (rute_map, data.latitude, data.longitude)
                                        img_map = '<img border="0" alt=" Mapa " src="//maps.googleapis.com/maps/api/staticmap?zoom=16&size=600x300&maptype=roadmap&markers=color:red%7C'
                                        img_map = '%s%s,%s">' % (img_map, data.latitude, data.longitude)
                                        url_map = '<a href="%s">%s</a>' % (rute_map, img_map)

                                        html_map = '%s%s' % (url_street, url_map)
                                        vals_email['subject'] = 'SOLES Alert'
                                        vals_email['email_to'] = None

                                        if status_geofence == 'IN':
                                            vals['geofence_id'] = polygon[0]

                                            if data_vehicle.geofence_id.id == False:
                                                vals_vehicle['geofence_id'] = polygon[0]
                                                vehicle_obj.write(self, data.device_id.id, vals_vehicle,
                                                                  context=None)
                                                if polygon[2]:
                                                    send_email = 1
                                                    vals_email['email_to'] = polygon[2]
                                                    html_geofence = '<tr><td><b>Event</b></td><td> In geofenece %s</td></tr>' % (
                                                        data_vehicle.geofence_id.name)
                                                    vals_email['subject'] = '%s :: In geofence :: %s' % (
                                                    vals_email['subject'], data_vehicle.geofence_id.name)

                                        if status_geofence == 'OUT':
                                            if data_vehicle.geofence_id.id == polygon[0]:
                                                vals_vehicle['geofence_id'] = 0
                                                if polygon[3]:
                                                    send_email = 1
                                                    vals_email['email_to'] = polygon[3]
                                                    html_geofence = '<tr><td><b>Event</b></td><td> Out geofenece %s</td></tr>' % (
                                                        data_vehicle.geofence_id.name)
                                                    vals_email['subject'] = '%s :: Out geofence :: %s' % (
                                                    vals_email['subject'], data_vehicle.geofence_id.name)
                                                vehicle_obj.write(self, data.device_id.id, vals_vehicle,
                                                                  context=None)

                                        vals_email[
                                            'body_html'] = '<html><body><center><table width="1000">%s%s%s%s%s%s%s</table>%s</center></body></html>' % (
                                        html_model, html_plate, html_driver, html_date, html_geofence, html_odometer,
                                        html_speed, html_map)

                                        if send_email == 1:
                                            vals_email[
                                                'email_from'] = 'SOLES Alerta<alertas@soluciones-satelitales.com>'

                                            if vals_email['email_to'] != None:
                                                # vals_email['email_to']     ='evigra@hotmail.com'
                                                mail_id = mail_obj.create(self, vals_email, context=None)
                                                mail_obj.send(self, mail_id)
                    positions_obj.write(self, data.id, vals, context=None)

        return True
        # return vals
        """
    def init(self, self):
        print 'INICIO ----------------------------'         
        self.pre_borrado(self, 1)
        
        
    def browse(self,self, select, context):
        print 'BROWSE------------------------'
        return super(positions, self).browse(self, select, context)       

    def create(self, self, vals, context=False):
        if context is None:
            context = {}
        print "CREATE positions ------------------------------ "
        #self.method(self)
     
        return super(positions, self).create(self, vals, context=context)        
        """

    address = fields.Char('Calle', size=150)
    date = fields.Char('FechaString', size=50)
    altitude = fields.Float('Altura', digits=(6, 2))
    course = fields.Integer('Curso')
    latitude = fields.Float('Latitud', digits=(5, 30))
    longitude = fields.Float('Longitud', digits=(5, 30))
    other = fields.Char('Otros', size=5000)
    state = fields.Char('State', size=10)
    speed = fields.Integer('Velocidad')
    times = fields.Datetime('Fecha')
    valid = fields.Integer('Valido')
    mysql_id = fields.Integer('mysql')

    device_id = fields.Many2one('fleet.vehicle', ondelete='set null', string="Dispositivo", index=True)

    protocol = fields.Char('Protocolo', size=15)
    event = fields.Char('Evento', size=40)
    event_id = fields.Many2one('gpsmaps.events', ondelete='set null', string="Evento", index=True)
    geofence_id = fields.Many2one('gpsmaps.geofence', ondelete='set null', string="Geocerca", index=True)
    gsm = fields.Integer('Senal')
    hdop = fields.Float('Exactitud', digits=(2, 2))
    milage = fields.Integer('Millas')
    satellites = fields.Integer('Satelites')
    batery = fields.Float('Bateria', digits=(3, 2))
    battery = fields.Float('Bateria', digits=(3, 2))
    power = fields.Float('Energia', digits=(3, 2))
    # preborrado = fields.Integer('Valido')


class geofence(models.Model):
    _name = "gpsmaps.geofence"

    name = fields.Char('Geofence', size=80)
    geofence = fields.Char('Geofence', size=80)
    company_id = fields.Many2one('res.company', ondelete='set null', string="Company", index=True)
    points = fields.Char('Points', size=5000)

    in_geofence_mail = fields.Char('In geofence', size=500)
    out_geofence_mail = fields.Char('Out geofence', size=500)


class protocol(models.Model):
    _name = "gpsmaps.protocol"

    protocol = fields.Char('Protocol', size=100)
    name = fields.Char('Nombre', size=100)
    speed = fields.Float('Velocidad', digits=(3, 5))
    milage = fields.Float('Millas', digits=(3, 5))


class events(models.Model):
    _name = "gpsmaps.events"

    code = fields.Char('Code', size=10)
    protocol_id = fields.Many2one('gpsmaps.protocol', ondelete='set null', string="Protocolo", index=True)
    standar_id = fields.Many2one('gpsmaps.standar', ondelete='set null', string="Estandar", index=True)
    name = fields.Char('Name', size=100)


class standar(models.Model):
    _name = "gpsmaps.standar"

    code = fields.Char('Code', size=10)
    name = fields.Char('Name', size=100)


class devices(models.Model):
    _name = "gpsmaps.devices"

    name = fields.Char('Name', size=100)
    vehicle_id = fields.Many2one('fleet.vehicle', ondelete='set null', string="Vehiculo", index=True)
    gsm = fields.Char('GSM', size=15)
    password = fields.Char('Pass', size=15)
    date_start = fields.Datetime('Fecha inicio')
    date_end = fields.Datetime('Fecha fin')
    date = fields.Datetime('Ultima Recarga')
    total = fields.Integer('Millas')


class travel(models.Model):
    _name = "gpsmaps.travel"

    name = fields.Char('Name', size=100)
    code = fields.Char('Code', size=10)

    start = fields.Char('Start', size=10)
    start_point = fields.Char('Point start', size=10)
    start_geofence_id = fields.Many2one('gpsmaps.geofence', ondelete='set null', string="Geofence Start", index=True)

    end = fields.Char('End', size=10)
    end_point = fields.Char('Point end', size=10)
    end_geofence_id = fields.Many2one('gpsmaps.geofence', ondelete='set null', string="Geofence End", index=True)


class vehicle(models.Model):
    _inherit = "fleet.vehicle"

    phone = fields.Char('Phone', size=50)
    imei = fields.Char('Imei', size=50)
    position_id = fields.Many2one('gpsmaps.positions', ondelete='set null', string="Ultima Posicion", index=True)

    # image_gps = fields.selection([('01','Carro 1'), ('02','Carro 2'),  ('03','Carro 3'), ('90','Celular 1'), ('91','Celular 2'), ('92','Celular 3'), ('93','Celular 4')  ], 'Imagen')

    image_gps = fields.Char('Imagen', size=2)
    geofence_id = fields.Many2one('gpsmaps.geofence', ondelete='set null', string="Geofence", index=True)

    all_mail = fields.Integer('Mail general')

    speed_alert = fields.Integer('Velocidad de alerta')
    speed_mail = fields.Integer('Mail por velocidad')

    stop_mail = fields.Integer('Mail por parada')
    start_mail = fields.Integer('Mail por inicio')
    history = fields.Integer('Historial')
