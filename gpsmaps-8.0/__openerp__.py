{
    'name' : 'GPS MAPS',
    'version': '1.0',
    'summary': 'GPS GoogleMaps V3',
    'category': 'GPS Maps',
    'author': 'Soluciones Satelitales :: EVIGRA',
    'description':
        """
Base GMaps
=================

Se cargara el api de Google Maps en un nuevo menu.
        """,
    'data': [
        "security/gpsmaps_security.xml",
        "security/ir.model.access.csv",
        "gpsmaps.xml",    
    ],
    'depends' : ['fleet'],
    'js': [        
        'static/src/js/gpsmaps.js'
    ],
    'qweb': ['static/src/xml/*.xml'],
    'application': True
}
