# -*- coding: utf-8 -*-
# Copyright 2012, Israel Cruz Argil, Argil Consulting
# Copyright 2016, Jarsa Sistemas, S.A. de C.V.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from datetime import datetime

from odoo import api, fields, models


class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'
    _description = "Vehicle"
    _order = 'name'

    name = fields.Char(compute=False, required=True)
    operating_unit_id = fields.Many2one(
        'operating.unit', string='Operating Unit')
    year_model = fields.Char()
    serial_number = fields.Char()
    registration = fields.Char()
    fleet_type = fields.Selection(
        [('tractor', 'Motorized Unit'),
         ('trailer', 'Trailer'),
         ('dolly', 'Dolly'),
         ('other', 'Other')],
        string='Unit Fleet Type')
    notes = fields.Text()
    active = fields.Boolean(default=True)
    driver_id = fields.Many2one('res.partner', string="Driver")
    employee_id = fields.Many2one(
        'hr.employee',
        string="Driver",
        domain=[('driver', '=', True)])
    expense_ids = fields.One2many('tms.expense', 'unit_id', string='Expenses')
    engine_id = fields.Many2one('fleet.vehicle.engine', string='Engine')
    supplier_unit = fields.Boolean()
    unit_extradata = fields.One2many(
        'tms.extradata', 'vehicle_id',
        string='Extra Data Fields',
        readonly=False)
    insurance_policy = fields.Char()
    insurance_policy_data = fields.Char()
    insurance_expiration = fields.Date()
    insurance_supplier_id = fields.Many2one(
        'res.partner', string='Insurance Supplier')
    insurance_days_to_expire = fields.Integer(
        compute='_compute_insurance_days_to_expire', string='Days to expire')

    @api.depends('insurance_expiration')
    def _compute_insurance_days_to_expire(self):
        for rec in self:
            now = datetime.now()
            date_expire = datetime.strptime(
                rec.insurance_expiration,
                '%Y-%m-%d') if rec.insurance_expiration else datetime.now()
            delta = date_expire - now
            if delta.days >= -1:
                rec.insurance_days_to_expire = delta.days + 1
            else:
                rec.insurance_days_to_expire = 0
