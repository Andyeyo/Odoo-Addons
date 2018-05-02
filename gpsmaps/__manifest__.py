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
    'depends' : ['fleet'],
    'js': [
        'static/src/js/gpsmaps.js'
    ],
    'qweb': [
        "static/src/xml/gpsmaps.xml",
        "static/src/xml/gpsmaps_history.xml",
        "static/src/xml/gpsmaps_history_street.xml",
        "static/src/xml/gpsmaps_map.xml",
        "static/src/xml/gpsmaps_street.xml"],
    'data': [
        "security/gpsmaps_security.xml",
        "security/ir.model.access.csv",
        "gpsmaps.xml",
        # "gpsmaps_data.xml",
        # "gpsmaps_security.xml",
    ],
    'application': True
}
