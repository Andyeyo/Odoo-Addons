# -*- coding: utf-8 -*-
from odoo import http


class Example(http.Controller):

    @http.route('/example', type='http', auth='public', website=True)
    # :param example: Because Odoo needs to know which URL links to what (XML)
    #       template you’ll need to provide the URL first. In this example it means that
    #       http://localhost/example would call this @http.route
    # :param type=’http’: This will let Odoo know that your page is running in HTTP.
    # :param auth=’public’: Tells Odoo who can view the page.
    #       You can choose between ‘public’, ‘user’ and ‘none’. If you choose ‘public’ anybody can
    #       view the page. When you choose ‘user’ only logged in people can view this page and
    #       if  you choose ‘none’ there will be no facilities to access the database or any configuration.
    # :param website=True: Tells Odoo that is has to link to a web page and that it is not just a Python function.
    def render_example_page(self):
        """Parse a decoded CSV file and return head list and data list
        :param self: all context
        :returns: http.request.render will call the view renderer from the Odoo framework.
        within the brackets “()” you have to specify the module_name.page_name.
        In this case my module is named ‘create_webpage_demo’ and I will create a web
        page with the technical name ‘page_name’.
        """
        return http.request.render('create_webpage_demo.example_page', {})  # {} for args

    @http.route('/example/detail', type='http', auth='public', website=True)
    def navigate_to_detail_page(self):
        # This will get all company details (in case of multi company this are multiple records)
        companies = http.request.env['res.company'].sudo().search([])
        return http.request.render('create_webpage_demo.detail_page', {
            # pass company details to the webpage in a variable
            'companies': companies})
