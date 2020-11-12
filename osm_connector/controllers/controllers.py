# -*- coding: utf-8 -*-
# from odoo import http


# class OsmConnector(http.Controller):
#     @http.route('/osm_connector/osm_connector/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/osm_connector/osm_connector/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('osm_connector.listing', {
#             'root': '/osm_connector/osm_connector',
#             'objects': http.request.env['osm_connector.osm_connector'].search([]),
#         })

#     @http.route('/osm_connector/osm_connector/objects/<model("osm_connector.osm_connector"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('osm_connector.object', {
#             'object': obj
#         })
