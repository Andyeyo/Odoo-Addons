# -*- coding: utf-8 -*-

import json

from odoo import models, fields, api, _
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon


class DemoOsmView(models.Model):
    _name = 'osm_connector.demo'
    _description = "Osm Connector"

    name = fields.Char(strin="Name")
    map  = fields.Char(string = "Map")
    lat  = fields.Float(string='Geo Latitude', digits=(16, 5)) 
    lng  = fields.Float(string='Geo Longitude', digits=(16, 5))

    def calculatePoints(self):
        point = Point(self.lat, self.lng)
        print(Polygon())
        point_list = [] 
        for x in json.loads(self.map)['position'][0]:
            point_list.append( (x['lat'], x['lng']) )
        polygon = Polygon(point_list)
        print(polygon.contains(point))
        print(self)
