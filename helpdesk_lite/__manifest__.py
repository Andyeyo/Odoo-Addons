# -*- coding: utf-8 -*-
{
    'name': "HelpDesk",
    'version': "0.1",
    'author': "Golubev",
    'category': "Tools",
    'support': "golubev@svami.in.ua",
    'summary': "A helpdesk / support ticket system",
    'description': "A helpdesk / support ticket system",
    'license':'LGPL-3',
    'data': [
        'security/helpdesk_security.xml',
        'security/ir.model.access.csv',
        'views/helpdesk_tickets.xml',
        'views/helpdesk_team_views.xml',
        'views/helpdesk_stage_views.xml',
        'views/helpdesk_data.xml',
        'views/res_config_views.xml',
        'views/templates.xml',

    ],
    'demo': [
        'demo/helpdesk_demo.xml',
    ],
    'depends': ['base','mail'],
    'application': True,
}
