# -*- coding: utf-8 -*-
from odoo import http

# class OsmViewTest(http.Controller):
#     @http.route('/osm_view_test/osm_view_test/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/osm_view_test/osm_view_test/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('osm_view_test.listing', {
#             'root': '/osm_view_test/osm_view_test',
#             'objects': http.request.env['osm_view_test.osm_view_test'].search([]),
#         })

#     @http.route('/osm_view_test/osm_view_test/objects/<model("osm_view_test.osm_view_test"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('osm_view_test.object', {
#             'object': obj
#         })