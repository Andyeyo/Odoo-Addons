# -*- coding: utf-8 -*-
# Copyright 2016, Jarsa Sistemas, S.A. de C.V.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class TmsCustom(models.Model):
    _name = 'tms.custom.house'

    custom_ids = fields.One2many('tms.customs', 'custom_house_id',
                                 string="Custom House")
    name = fields.Char()
