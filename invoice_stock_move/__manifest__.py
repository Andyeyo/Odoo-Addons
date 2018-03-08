# -*- coding: utf-8 -*-
{
    'name': "Stock Picking From Invoice",
    'version': '10.0.1.0.0',
    'summary': """Stock Picking From Customer/Supplier Invoice""",
    'description': """This Module Enables To Create Stocks Picking From Customer/Supplier Invoice""",
    'author': "Andres Ramos <oaramos414@gmail.com>",
    'company': 'MivilSoft',
    'website': "https://www.miviltech.com",
    'category': 'Accounting',
    'depends': ['base', 'account', 'stock'],
    'data': ['views/invoice_stock_move_view.xml'],
    'images': ['static/description/banner.jpg'],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
