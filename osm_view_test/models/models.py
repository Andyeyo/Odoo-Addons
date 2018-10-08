# -*- coding: utf-8 -*-

from odoo import models, fields


class osm_view_test(models.Model):
    _name = 'osm_view_test.osm_view_test'

    bus_stop = fields.Char()
    name = fields.Char()
    latitude = fields.Float()
    longitude = fields.Float()
    end_hour = fields.Float()
    desc = fields.Char()
