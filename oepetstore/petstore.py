from odoo import api, fields, models

class message_of_the_day(models.Model):
    _name = "oepetstore.message_of_the_day"

    @api.model
    def my_method(self):
        return {"hello": "world"}

    message = fields.Text()
    latitude = fields.Char(string="Latitude")
    longitude = fields.Char(string="Longitude")
    color = fields.Char(size=20)


class product(models.Model):
    _inherit = "product.product"

    max_quantity = fields.Float(string="Maximum Quantity")

