# -*- coding: utf-8 -*-
{
    'name': 'GWS Google Maps',
    'version': '12.0.1.0.0',
    'author': 'Odoo Engineering',
    'license': 'AGPL-3',
    'maintainer': 'Vernon Hogan <techsupport@greensborowebservices.com>',
    'category': 'Extra Tools',
    'description': """
Web Google Map and google places autocomplete address form
==========================================================

This module brings Web Google Map modification to use together with GWS modules
""",
    'depends': [
        'base_setup',
        'base_geolocalize',
        'contacts'
    ],
    'website': '',
    'data': [
        'data/google_maps_libraries.xml',
        'views/google_places_template.xml',
        'views/res_partner.xml',
        'views/res_config_settings.xml'
    ],
    'demo': [],
    'images': ['static/description/thumbnails.png'],
    'qweb': ['static/src/xml/widget_places.xml'],
    'installable': True,
    'application': False,
    'auto_install': False,
    'uninstall_hook': 'uninstall_hook',
}
