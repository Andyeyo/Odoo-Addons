# -*- coding: utf-8 -*-
{
    'name': "Open Street Maps Connector with Odoo 13",

    'summary': """
       Now you can use open street maps as views and widgets from odoo""",

    'description': """
        Welcome to OpenStreetMap from Odoo 13, the project that creates and 
        distributes free geographic data for the world. Now you can use the map 
        from Odoo. This module brings four new features:
           * New view map allows user to view all addresses on open street maps.
           * Map Localization.
           * New widget enabled to set a point location.
    """,

    'author': "MivilSoft S.A.",
    'website': "https://www.mivilsoft.com",
    'maintainer': 'Andres Ramos <andres.ramos@mivilsoft.com>',
    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/13.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Extra Tools',
    'version': '13.0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'views/data.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    
    'qweb': ['static/src/xml/osm_template.xml'],
}
