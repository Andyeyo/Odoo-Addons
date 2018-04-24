odoo.odoo_timepicker = function(instance, local) {
    var QWeb = instance.web.qweb;

    local.Timepicker = instance.web.form.AbstractField.extend({
        events: {
            'change input': function (e) {
                if (!this.get('effective_readonly')) {
                    var selectedTime = $(e.currentTarget).timepicker('getTime');
                    this.internal_set_value(selectedTime.$format('H:i:s'));
                }
            }
        },

        init: function () {
            this._super.apply(this, arguments);
            this.set("value", "");
            this.widget = this;
            this.defaultOptions = {
                disableTextInput: true,
                renderFormat: 'H:i%p'
            }
        },

        start: function() {
            this.options = _.extend(this.defaultOptions, this.options);

            this.on("change:effective_readonly", this, function() {
                this.display_field();
                this.render_value();
            });
            this.display_field();
            return this._super();
        },

        display_field: function() {
            this.$el.html(QWeb.render("FieldTimepicker", {widget: this}));
        },

        render_value: function () {
            var selectedTime = this.get("value");
            var formatedTime = '';

            if (selectedTime) {
                var d = new Date('1970-01-01 ' + this.get("value"));
                formatedTime = d.$format(this.options.renderFormat);
            }

            if (this.get('effective_readonly')) {
                this.$el.text(formatedTime);
            } else {
                this.$('input').timepicker(this.options);
                this.$('input').val(formatedTime);
            }
        }
    });

    instance.web.form.widgets.add('odoo_timepicker', 'instance.odoo_timepicker.Timepicker')
}