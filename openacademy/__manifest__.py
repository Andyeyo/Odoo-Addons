# -*- coding: utf-8 -*-
{
    'name': "Open Academy",

    'summary': """
        Administración de Entrenamientos""",

    'description': """
        Módulo de Open Academy para la gestión de entrenamientos:
            - Cursos de formación
            - Sesiones de entrenamiento
            - Registro de asistentes
    """,

    'author': "Andres Ramos <oaramos414@gmail.com>",

    'website': "http://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Test',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'report', 'board'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        #'views/views.xml',
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/openacademy.xml',
        'views/partner.xml',
        'views/session_workflow.xml',
        'views/session_board.xml',
        'reports/reports.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}