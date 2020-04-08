# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class DeviceIot(models.Model):
    _name = 'smart_waste_iot.device_iot'
    _description = "Smart Waste Management"

    name  = fields.Char ( string = "Device Code", required = True)  # Code is for m2o
    lng   = fields.Float( string = "Longitude")
    lat   = fields.Float( string = "Latitude")
    map   = fields.Char ( string = "Map")
    
    height = fields.Float( string = "Height", digits=(6, 2))
    active = fields.Boolean(default=True)
    state  = fields.Selection( [('empty', 'Empty'), ('full', 'Full')],
                              string = "State", default = 'empty' )
    
    taken_height = fields.Float(string = "Taken height", compute='_taken_height')
    waste_ids    = fields.Float(string = "Wastes")

    traccar_imei      = fields.Char( string = "IMEI" )
    traccar_devide_id = fields.Char( string = "Device ID" )


    _sql_constraints = [
        ('name_unique',
         'UNIQUE(name)',
         "The device code must be unique"),
    ]

    @api.depends('height', 'waste_ids')
    def _taken_height(self):
        for r in self:
            if not r.height:
                r.taken_height = 0.0
            else:
                # r.taken_height = 100.0 * len(r.waste_ids) / r.height
                r.taken_height = 100.0 * r.waste_ids / r.height

    
    @api.onchange('height', 'waste_ids')
    def _verify_valid_height(self):
        if self.height < 0:
            return {
                'warning': {
                    'title': _("Incorrect 'height' value"),
                    'message': _("The number of available height may not be negative"),
                },
            }
        if self.height < self.waste_ids:
            return {
                'warning': {
                    'title': _("Too many wastes"),
                    'message': _("Increase height or remove excess wastes"),
                },
            }