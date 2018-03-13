# -*- coding: utf-8 -*-

from datetime import timedelta
from odoo import models, fields, api, exceptions
# class openacademy(models.Model):
#     _name = 'openacademy.openacademy'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         self.value2 = float(self.value) / 100

class Course(models.Model):
     _name = 'openacademy.course'

     name = fields.Char(string="Título", required=True)
     description = fields.Text()

     #res.users son los usuarios de Odoo
     responsible_id = fields.Many2one('res.users', ondelete='set null',
                                      string="Responsable", index = True)
     session_ids = fields.One2many('openacademy.session',
                                   'course_id',
                                   string="Sesiones")

     @api.multi
     def copy(self, default=None):
         default = dict(default or {})
         import pdb; pdb.set_trace()

         copied_count = self.search_count(
             [('name', '=like', u"Copia de {}%".format(self.name))])

         if not copied_count:
             new_name = u"Copia de {}".format(self.name)

         else:
             new_name = u"Copia de {} ({})".format(self.name, copied_count)

         default['name'] = new_name
         return super(Course, self).copy(default)

     # Hay dos tipos de constraint: SQL - PYTHON
     # Este es un constraint propio de SQL
     _sql_constraints = [
         ('name_description_check',  #Es el nombre del constraint
          'CHECK(name != description)', #Es la condicion
          "El título del curso no debe ser el de la descripción"), #Es el mensaje

         ('name_unique', #Es el nombre del constraint
          'UNIQUE(name)', #Es la condicion
          "El título del curso debe ser único"), #Es el mensaje
     ]


class Session(models.Model):
    _name = 'openacademy.session'

    name = fields.Char(required=True)
    start_date = fields.Date(string="Fecha de Inicio", default=fields.Date.today)
    duration = fields.Float(digits=(6, 2), help="Duración en días")
    seats = fields.Integer(string="Número de asientos")
    active = fields.Boolean(default=True)
    color = fields.Integer()


    #res.parnter es para clientes, proveedores, empleado
    instructor_id = fields.Many2one('res.partner', string="Instructor",
                                    domain=['|',
                                            ('instructor','=',True),
                                            ('category_id.name','ilike',"Teacher")])

    course_id = fields.Many2one('openacademy.course',
                                ondelete='cascade',
                                string="Curso",
                                required=True)

    attendee_ids = fields.Many2many('res.partner',string="Asistentes")

    taken_seats = fields.Float(string="Asientos Tomados", compute='_taken_seats')

    end_date = fields.Date(string="Fecha Final", store=True,
                           compute="_get_end_date", inverse="_set_end_date")
                            #inverse es para drag and drop del campo end_date

    hours = fields.Float(string="Duración en horas",
                         compute="_get_hours", inverse="_set_hours")

    attendees_count = fields.Integer(
        string="Número de Asistentes", compute='_get_attendees_count', store=True)

    state = fields.Selection([
        ('draft', "Borrador"),
        ('confirmed', "Confirmado"),
        ('done', "Realizado"),
    ], default='draft')

    @api.multi
    def action_draft(self):
        self.state = 'draft'

    @api.multi
    def action_confirm(self):
        self.state = 'confirmed'

    @api.multi
    def action_done(self):
        self.state = 'done'

    @api.depends('seats', 'attendee_ids')
    def _taken_seats(self):
        for r in self:
            if not r.seats:
                r.taken_seats = 0.0
            else:
                r.taken_seats = 100.0 * len(r.attendee_ids) / r.seats


    @api.onchange('seats', 'attendee_ids')
    def _verify_valid_seats(self):
        if self.seats < 0:
            return {
                'warning': {
                    'title': "Incorrecto número de 'asientos'",
                    'message': "El número disponibles de asientos no debe ser negativo",
                },
            }
        if self.seats < len(self.attendee_ids):
            return {
                'warning': {
                    'title': "Demasiados asistentes",
                    'message': "Aumentar el número de asientos o Disminuir el número de asistentes",
                },
            }

    @api.depends('start_date', 'duration')
    def _get_end_date(self):
        for r in self:
            if not (r.start_date and r.duration):
                r.end_date = r.start_date
                continue

            # Add duration to start_date, but: Monday + 5 days = Saturday, so
            # subtract one second to get on Friday instead
            start = fields.Datetime.from_string(r.start_date)
            duration = timedelta(days=r.duration, seconds=-1)
            r.end_date = start + duration

    def _set_end_date(self):
        for r in self:
            if not (r.start_date and r.end_date):
                continue

            # Compute the difference between dates, but: Friday - Monday = 4 days,
            # so add one day to get 5 days instead
            start_date = fields.Datetime.from_string(r.start_date)
            end_date = fields.Datetime.from_string(r.end_date)
            r.duration = (end_date - start_date).days + 1

    @api.depends('duration')
    def _get_hours(self):
        for r in self:
            r.hours = r.duration * 24

    def _set_hours(self):
        for r in self:
            r.duration = r.hours / 24

    @api.depends('attendee_ids')
    def _get_attendees_count(self):
        for r in self:
            r.attendees_count = len(r.attendee_ids)

    #Hay dos tipos de constraint: SQL - PYTHON
    #Este es un constraint propio de python
    @api.constrains('instructor_id', 'attendee_ids')
    def _check_instructor_not_in_attendees(self):
        for r in self:
            if r.instructor_id and r.instructor_id in r.attendee_ids:
                raise exceptions.ValidationError("El instructor de una sesión no puede ser un asistente")

