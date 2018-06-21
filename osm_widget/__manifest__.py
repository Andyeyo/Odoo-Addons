{
    'name': 'OSM Map',
    'version': '0.1',
    'category': 'Industries',
    'summary': 'Show asset position',
    'description': """
Show Asset on Map
==========================
Support following feature:
    * Edit asset position
    """,
    'author': 'Andres Ramos',
    'license': 'AGPL-3',
    'website': 'http://codup.com',
    'sequence': 0,
    'data': [
        'views/osm_template.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'images': [
        'static/src/images/layers.png',
        'static/src/images/layers-2x.png',
        'static/src/images/marker-icon.png',
        'static/src/images/marker-icon-2x.png',
        'static/src/images/marker-shadow.png',
        'static/src/images/spritesheet.png',
        'static/src/images/spritesheet.svg',
        'static/src/images/spritesheet-2x.png',
    ],
    'installable': True,
}
