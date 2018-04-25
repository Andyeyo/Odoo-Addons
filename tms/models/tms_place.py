# -*- coding: utf-8 -*-
# Copyright 2012, Israel Cruz Argil, Argil Consulting
# Copyright 2016, Jarsa Sistemas, S.A. de C.V.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging
import urllib as my_urllib

from odoo import _, api, fields
from odoo.addons.base_geoengine import fields as geo_fields
from odoo.addons.base_geoengine import geo_model
from odoo.exceptions import ValidationError

import simplejson as json

_logger = logging.getLogger(__name__)
try:
    from pyproj import Proj, transform
    import geojson
except ImportError:
    _logger.debug('Cannot `import pyproj or geojson`.')


class TmsPlace(geo_model.GeoModel):
    _name = 'tms.place'
    _description = 'Cities / Places'

    name = fields.Char('Place', size=64, required=True, index=True)
    complete_name = fields.Char(compute='_compute_complete_name')
    state_id = fields.Many2one(
        'res.country.state',
        string='State Name')
    country_id = fields.Many2one(
        'res.country',
        string='Country')
    latitude = fields.Float(
        required=False, digits=(20, 10),
        help='GPS Latitude')
    longitude = fields.Float(
        required=False, digits=(20, 10),
        help='GPS Longitude')
    point = geo_fields.GeoPoint(
        string='Coordinate',
        compute='_compute_point',
        inverse='_set_lat_long',
    )

    @api.onchange('state_id')
    def get_country_id(self):
        for rec in self:
            if rec.state_id:
                rec.country_id = rec.state_id.country_id
            else:
                rec.country_id = False

    @api.multi
    def get_coordinates(self):
        for rec in self:
            if rec.name and rec.state_id:
                address = (rec.name + "," + rec.state_id.name + "," +
                           rec.state_id.country_id.name)
            else:
                raise ValidationError(
                    _("You need to set a Place and a State Name"))
            google_url = (
                'http://maps.googleapis.com/maps/api/geocode/json?' +
                'address=' + address.encode('utf-8') + '&sensor=false')
            try:
                result = json.load(my_urllib.urlopen(google_url))
                if result['status'] == 'OK':
                    location = result['results'][0]['geometry']['location']
                    self.latitude = location['lat']
                    self.longitude = location['lng']
            except Exception:
                raise ValidationError(_("Google Maps is not available."))

    @api.multi
    def open_in_google(self):
        for place in self:
            url = ("/tms/static/src/googlemaps/get_place_from_coords.html?" +
                   str(place.latitude) + ',' + str(place.longitude))
        return {
            'type': 'ir.actions.act_url',
            'url': url,
            'nodestroy': True,
            'target': 'new'}

    @api.depends('name', 'state_id')
    def _compute_complete_name(self):
        for rec in self:
            if rec.state_id:
                rec.complete_name = rec.name + ', ' + rec.state_id.name
            else:
                rec.complete_name = rec.name

    @api.depends('latitude', 'longitude')
    def _compute_point(self):
        for rec in self:
            rec.point = geo_fields.GeoPoint.from_latlon(
                self.env.cr, rec.latitude, rec.longitude).wkb_hex

    def set_lang_long(self):
        point_x, point_y = geojson.loads(self.point)['coordinates']
        inproj = Proj(init='epsg:3857')
        outproj = Proj(init='epsg:4326')
        longitude, latitude = transform(inproj, outproj, point_x, point_y)
        self.latitude = latitude
        self.longitude = longitude

    @api.onchange('point')
    def onchange_geo_point(self):
        if self.point:
            self.set_lang_long()

    @api.depends('point')
    def _set_lat_long(self):
        for rec in self:
            if rec.point:
                rec.set_lang_long()
