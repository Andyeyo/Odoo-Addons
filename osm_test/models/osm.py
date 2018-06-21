
from odoo import fields, models


class Osm(models.Model):
    _name = "osm.test"

    map = fields.Char('Map')
    longitude = fields.Float(string='Longitude')
    latitude = fields.Float(string='Latitude')
