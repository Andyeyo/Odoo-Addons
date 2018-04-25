# -*- coding: utf-8 -*-
# Copyright 2012, Israel Cruz Argil, Argil Consulting
# Copyright 2016, Jarsa Sistemas, S.A. de C.V.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class TmsAdvance(models.Model):
    _name = 'tms.advance'
    _inherit = ['mail.thread', 'ir.needaction_mixin']
    _description = 'Money advance payments for Travel expenses'
    _order = "name desc, date desc"

    operating_unit_id = fields.Many2one(
        'operating.unit', string='Operating Unit', required=True)
    name = fields.Char(string='Advance Number')
    state = fields.Selection(
        [('draft', 'Draft'),
         ('authorized', 'Waiting for authorization'),
         ('approved', 'Approved'),
         ('confirmed', 'Confirmed'),
         ('closed', 'Closed'),
         ('cancel', 'Cancelled'), ],
        readonly=True,
        default='draft')
    date = fields.Date(
        required=True,
        default=fields.Date.context_today)
    travel_id = fields.Many2one(
        'tms.travel',
        required=True,
        string='Travel')
    unit_id = fields.Many2one(
        'fleet.vehicle',
        compute='_compute_unit_id',
        string='Unit',
        store=True,)
    employee_id = fields.Many2one(
        'hr.employee',
        compute='_compute_employee_id',
        string='Driver',
        store=True,)
    amount = fields.Monetary(required=True)
    notes = fields.Text()
    move_id = fields.Many2one(
        'account.move', 'Journal Entry',
        help="Link to the automatically generated Journal Items.\nThis move "
        "is only for Travel Expense Records with balance < 0.0",
        readonly=True,
        ondelete='restrict',)
    paid = fields.Boolean(
        compute='_compute_paid',
        readonly=True,
        store=True,)
    payment_move_id = fields.Many2one(
        'account.move',
        string="Payment Entry",
        readonly=True,)
    currency_id = fields.Many2one(
        'res.currency',
        'Currency',
        required=True,
        default=lambda self: self.env.user.company_id.currency_id)
    auto_expense = fields.Boolean(
        help="Check this if you want this product and amount to be "
        "automatically created when Travel Expense Record is created.")
    expense_id = fields.Many2one(
        'tms.expense', 'Expense Record', readonly=True)
    product_id = fields.Many2one(
        'product.product', string='Product', required=True,
        domain=[('tms_product_category', '=', 'real_expense')])

    @api.multi
    @api.depends('travel_id')
    def _compute_unit_id(self):
        for rec in self:
            rec.unit_id = rec.travel_id.unit_id.id

    @api.depends('travel_id')
    def _compute_employee_id(self):
        for rec in self:
            rec.employee_id = rec.travel_id.employee_id.id

    @api.model
    def create(self, values):
        res = super(TmsAdvance, self).create(values)
        if res.operating_unit_id.advance_sequence_id:
            sequence = res.operating_unit_id.advance_sequence_id
        else:
            raise ValidationError(
                _('The sequence is not '
                    'defined in operating unit %s' %
                    res.operating_unit_id.name))
        if res.amount <= 0:
            raise ValidationError(
                _('The amount must be greater than zero.'))
        res.name = sequence.next_by_id()
        return res

    @api.onchange('travel_id')
    def _onchange_travel_id(self):
        self. unit_id = self.travel_id.unit_id.id
        self.employee_id = self.travel_id.employee_id.id

    @api.depends('payment_move_id')
    def _compute_paid(self):
        for rec in self:
            status = False
            if rec.payment_move_id:
                status = True
            rec.paid = status

    @api.multi
    def action_authorized(self):
        for rec in self:
            rec.state = 'approved'

    @api.multi
    def action_approve(self):
        for rec in self:
            if rec.amount > rec.operating_unit_id.credit_limit:
                rec.state = "authorized"
            else:
                rec.state = 'approved'
                rec.message_post(_('<strong>Advance approved.</strong>'))

    @api.multi
    def action_confirm(self):
        for rec in self:
            if rec.amount <= 0:
                raise ValidationError(
                    _('The amount must be greater than zero.'))
            if rec.move_id:
                raise ValidationError(
                    _('You can not confirm a confirmed advance.'))
            else:
                obj_account_move = self.env['account.move']
                advance_journal_id = (
                    rec.operating_unit_id.advance_journal_id.id)
                advance_debit_account_id = (
                    rec.employee_id.
                    tms_advance_account_id.id
                )
                advance_credit_account_id = (
                    rec.employee_id.
                    address_home_id.property_account_payable_id.id
                )
                if not advance_journal_id:
                    raise ValidationError(
                        _('Warning! The advance does not have a journal'
                          ' assigned. Check if you already set the '
                          'journal for advances in the base.'))
                if not advance_credit_account_id:
                    raise ValidationError(
                        _('Warning! The driver does not have a home address'
                          ' assigned. Check if you already set the '
                          'home address for the employee.'))
                if not advance_debit_account_id:
                    raise ValidationError(
                        _('Warning! You must have configured the accounts '
                          'of the tms'))
                move_lines = []
                notes = _('* Base: %s \n'
                          '* Advance: %s \n'
                          '* Travel: %s \n'
                          '* Driver: %s \n'
                          '* Vehicle: %s') % (
                    rec.operating_unit_id.name,
                    rec.name,
                    rec.travel_id.name,
                    rec.employee_id.name,
                    rec.unit_id.name)
                total = rec.currency_id.compute(
                    rec.amount,
                    self.env.user.currency_id)
                if total > 0.0:
                    accounts = {'credit': advance_credit_account_id,
                                'debit': advance_debit_account_id}
                    for name, account in accounts.items():
                        move_line = (0, 0, {
                            'name': rec.name,
                            'partner_id': (
                                rec.employee_id.address_home_id.id),
                            'account_id': account,
                            'narration': notes,
                            'debit': (total if name == 'debit' else 0.0),
                            'credit': (total if name == 'credit' else 0.0),
                            'journal_id': advance_journal_id,
                            'operating_unit_id': rec.operating_unit_id.id,
                        })
                        move_lines.append(move_line)
                    move = {
                        'date': fields.Date.today(),
                        'journal_id': advance_journal_id,
                        'name': _('Advance: %s') % (rec.name),
                        'line_ids': [line for line in move_lines],
                        'operating_unit_id': rec.operating_unit_id.id
                    }
                    move_id = obj_account_move.create(move)
                    move_id.post()
                    rec.move_id = move_id.id
                    rec.state = 'confirmed'
                    rec.message_post(
                        _('<strong>Advance confirmed.</strong>'))

    @api.multi
    def action_cancel(self):
        for rec in self:
            if rec.paid:
                raise ValidationError(
                    _('Could not cancel this advance because'
                        ' the advance is already paid. '
                        'Please cancel the payment first.'))
            move_id = rec.move_id
            rec.move_id = False
            move_id.button_cancel()
            move_id.unlink()
            rec.state = 'cancel'
            rec.message_post(_('<strong>Advance cancelled.</strong>'))

    @api.multi
    def action_cancel_draft(self):
        for rec in self:
            if rec.travel_id.state == 'cancel':
                raise ValidationError(
                    _('Could not set this advance to draft because'
                        ' the travel is cancelled.'))
            else:
                rec.state = 'draft'
                rec.message_post(_('<strong>Advance drafted.</strong>'))

    @api.multi
    def action_pay(self):
        for rec in self:
            bank = self.env['account.journal'].search(
                [('type', '=', 'bank')])[0]
            wiz = self.env['tms.wizard.payment'].with_context(
                active_model='tms.advance', active_ids=[rec.id]).create({
                    'journal_id': bank.id,
                    'amount_total': rec.amount,
                    'date': rec.date,
                })
            wiz.make_payment()
