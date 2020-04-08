# -*- coding: utf-8 -*-
{
    'name': "Smart Waste Management",

    'summary': """
    Utilizando el Internet de las Cosas (IoT) y el Big Data se puede mejorar 
    en eficiencia, en reducción de costes y en un menor impacto medioambiental.
        """,

    'description': """
        La Gestión de residuos eficaz y eficiente se convierte en un aliado 
        estratégico para ser una ciudad inteligente, ya que tiene una incidencia 
        directa en la calidad de vida de los ciudadanos.

        Effective and efficient waste management becomes a strategic ally 
        to be a smart city, since it has a direct impact on the quality of 
        life of citizens.
    """,

    'author': "MivilSoft",
    'website': "https://www.mivilsoft.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/13.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Localization',
    'version': '13.0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/device_iot_view.xml',
        'views/z_menu_view.xml',
    ],
    # only loaded in demonstration mode
    # 'demo': [
    #     'demo/demo.xml',
    # ],
}
