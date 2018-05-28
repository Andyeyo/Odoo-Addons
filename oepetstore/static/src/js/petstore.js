odoo.define('oepetstore.petstore', function (require) {
    "use strict";
    var Class = require('web.Class');
    var Widget = require('web.Widget');
    var core = require('web.core');
    var Model = require('web.DataModel');
    var data = require('web.data');
    var common = require('web.form_common');
    var QWeb = core.qweb;
    var utils = require('web.utils');
    var _t = core._t; // Traducciones
    var _lt = core._lt; // Traducciones
    var form_widgets = require('web.form_widgets');

    //Para la busqueda de elementos se puede ocupar this.$el.find("element_name")
    //Para la busqueda de elementos se puede ocupar this.$("element_name")


    var homePage = Widget.extend({
        //template: "HomePageTemplate", // Se puede ocupar en vez del QWeb.render, SE codifica en el init
        className: 'oe_petstore_homepage',
        // template: "HomePage",
        // template: "PetToysList",
        events: {
          'click .oe_petstore_pettoy': 'selected_item',
        },

        //region Description init Function
        init: function(parent) {
            this._super(parent); // This command is used to inherit the init method parent
            // console.log("Hello JS, I'm inside of init.");
            // this.name = "Andres Ramos";
        },
        //endregion

        start: function() {
            //console.log("Your pet store home page loaded");
            //this.$el.append("<div>Hello dear Odoo user!</div>"); // $el represents the section of page they're in charge of (as a jQuery object).
            //var greeting = new GreetingsWidget(this);
            //return greeting.appendTo(this.$el); // appendTo call the start function of GreetingsWidget
            //greeting es el contenido a agregar
            //this.$el donde se va a agregar por lo general al final
            // this.$el.append(QWeb.render("HomePageTemplate"));
            this.$el.append(QWeb.render("HomePageTemplate", {name: "Hola"})); //se ocupa sin el template

            var self = this;
            if (typeof google== 'undefined') {
                window.ginit = this.on_ready;
                $.getScript('http://maps.googleapis.com/maps/api/js?key=AIzaSyDjmCL795EQpe5j4rINKdq2rnCnHgt-Fic&amp&libraries=geometry,drawing&callback=ginit');
            }
            else {
                setTimeout(function () { self.on_ready(); }, 1000);
            }
           return this._super();

            // var map = new google.maps.Map(this.$(".map").get(0), {
            //     center: {lat: -34.397, lng: 150.644},
            //     zoom: 8
            // });
            // window.alert("HOla")


            ///////////////////////////////////////////////////////////
            //region Description - ProductsWidget
            // var products = new ProductsWidget(
            //     this, ["cpu", "mouse", "keyboard", "graphic card", "screen"], "#00FF00");
            // products.appendTo(this.$el);
            //endregion

            //region Description - ConfirmWidget
            // var widget = new ConfirmWidget(this);
            // widget.on("user_chose", this, this.user_chose);
            // widget.appendTo(this.$el);
            //endregion

            //region Description - color_changed
            // this.colorInput = new ColorInputWidget(this);
            // this.colorInput.on("change:color", this, this.color_changed);
            // return this.colorInput.appendTo(this.$el);
            //endregion


            //region Description- ORM
            // var self = this;
            // var model = new Model("oepetstore.message_of_the_day");
            // model.call("my_method", {context: new data.CompoundContext()}).then(function(result) {
            //     self.$el.append("<div>Hello " + result["hello"] + "</div>");
                     //});
                // will show "Hello world" to the user
                //endregion

            // return new MessageOfTheDay(this).appendTo(this.$el);

            //region Description - List of Products
            // return $.when(
            //     new PetToysList(this).appendTo(this.$('.oe_petstore_homepage_left')),
            //     new MessageOfTheDay(this).appendTo(this.$('.oe_petstore_homepage_right'))
            // );
            //endregion   List

            //region Description - Click
            // var self = this;
            // return new Model('product.product')
            //     .query(['name', 'image'])
            //     .filter([['categ_id.name', '=', "Pet Toys"]])
            //     .limit(5)
            //     .all()
            //     .then(function (results) {
            //         _(results).each(function (item) {
            //             self.$el.append(QWeb.render('PetToy', {item: item}));
            //         });
            //     });
            //endregion
        },

        on_ready: function(){

            // var div_gmap = this.$el[0];
            var map = new google.maps.Map(this.$(".map").get(0), {
                center: {lat: -2.0000000, lng: -77.5000000},
                zoom: 8
            });

            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [/*'marker',*/ 'circle', 'polygon', 'polyline', 'rectangle']
                },
                // markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
                circleOptions: {
                    fillColor: '#EFF8FB',
                    // fillOpacity: 1,
                    strokeWeight: 5,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                }
            });
            drawingManager.setMap(map);
            google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
                var coordinates = polygon.getPath().getLength();
                var htmlStr = "";
                for (var i = 0; i < coordinates; i++) {
                    console.log(polygon.getPath().getAt(i).toUrlValue(5));
                }
                // console.log(coordinates);
                // console.log(coordinates.scope("closure"))
            });
            google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
                alert(circle.getCenter());
                alert(circle.getRadius());
            });
        },

        selected_item: function (event) {
            window.alert("MEnsaje")
            this.do_action({
                type: 'ir.actions.act_window',
                res_model: 'product.product',
                res_id: $(event.currentTarget).data('id'),
                views: [[false, 'form']],
            });
        },

        messages_list:function (mensaje) {
            return mensaje;
        }
        //region Description - ConfirmWidget
        // user_chose: function(confirm) {
        //     if (confirm) {
        //         console.log("The user agreed to continue");
        //     } else {
        //         console.log("The user refused to continue");
        //     }
        // },
        //endregion

        //region Description - color_changed
        // color_changed: function() {
        //     this.$(".oe_color_div").css("background-color", this.colorInput.get("color"));
        // },
        //endregion
    });

    //region Description - Widget
    var ProductsWidget = Widget.extend({
        template: "ProductsWidget",
        init: function(parent, products, color) {
            this._super(parent);
            this.products = products;
            this.color = color;
        },
    });

    var GreetingsWidget = Widget.extend({
        classname: 'oe_petstore_greetings',
        start: function() {
            this.$el.append("<div>We are so happy to see you again in this menu!</div>");
        },
    });

    var ConfirmWidget = Widget.extend({
        events: {
            'click button.ok_button': function () {
                this.trigger('user_chose', true);
            },
            'click button.cancel_button': function () {
                this.trigger('user_chose', false);
            }
        },
        start: function() {
            this.$el.append("<div>Are you sure you want to perform this action?</div>" +
                "<button class='ok_button'>Ok</button>" +
                "<button class='cancel_button'>Cancel</button>");
        },
    });

    var ColorInputWidget = Widget.extend({
        template: "ColorInputWidget",
        events: {
            'change input': 'input_changed'
        },
        start: function() {
            this.input_changed();
            return this._super();
        },
        input_changed: function() {
            var color = [
                "#",
                this.$(".oe_color_red").val(),
                this.$(".oe_color_green").val(),
                this.$(".oe_color_blue").val()
            ].join('');
            this.set("color", color);
        },
    });

    var MessageOfTheDay = Widget.extend({
        template: "MessageOfTheDay",
        start: function() {
            var self = this;
            return new Model("oepetstore.message_of_the_day")
                .query(["message"])
                .order_by('-create_date', '-id')
                .first()
                .then(function(result) {
                    self.$(".oe_mywidget_message_of_the_day").text(result.message);
                });
        },
    });

    var PetToysList = Widget.extend({
        template: 'PetToysList',
        start: function () {
            var self = this;
            return new Model('product.product')
                .query(['name', 'image'])
                .filter([['categ_id.name', '=', "Pet Toys"]])
                .limit(5)
                .all()
                .then(function (results) {
                    _(results).each(function (item) {
                        self.$el.append(QWeb.render('PetToy', {item: item}));
                    });
                });
        }
    });

    var FieldChar2 = common.AbstractField.extend({
        init: function() {
            this._super.apply(this, arguments);
            this.set("value", "");
        },
        start: function() {
            this.on("change:effective_readonly", this, function() {
                this.display_field();
                this.render_value();
            });
            this.display_field();
            return this._super();
        },
        display_field: function() {
            var self = this;
            this.$el.html(QWeb.render("FieldChar2", {widget: this}));
            if (! this.get("effective_readonly")) {
                this.$("input").change(function() {
                    self.internal_set_value(self.$("input").val());
                });
            }
        },
        render_value: function() {
            if (this.get("effective_readonly")) {
                this.$el.text(this.get("value"));
            } else {
                this.$("input").val(this.get("value"));
            }
        },
    });

    var FieldColor = common.AbstractField.extend({
        events: {
            'change input': function (e) {
                if (!this.get('effective_readonly')) {
                    this.internal_set_value($(e.currentTarget).val());
                }
            }
        },
        init: function() {
            this._super.apply(this, arguments);
            this.set("value", "");
        },
        start: function() {
            this.on("change:effective_readonly", this, function() {
                this.display_field();
                this.render_value();
            });
            this.display_field();
            return this._super();
        },
        display_field: function() {
            this.$el.html(QWeb.render("FieldColor", {widget: this}));
        },
        render_value: function() {
            if (this.get("effective_readonly")) {
                this.$(".oe_field_color_content").css("background-color", this.get("value") || "#FFFFFF");
            } else {
                this.$("input").val(this.get("value") || "#FFFFFF");
            }
        },
    });

    var WidgetMultiplication = common.FormWidget.extend({
        start: function() {
            this._super();
            this.field_manager.on("field_changed:integer_a", this, this.display_result);
            this.field_manager.on("field_changed:integer_b", this, this.display_result);
            this.display_result();
        },
        display_result: function() {
            var result = this.field_manager.get_field_value("integer_a") *
                this.field_manager.get_field_value("integer_b");
            this.$el.text("a*b = " + result);
        }
    });

    var WidgetCoordinates = common.FormWidget.extend({
        events: {
            'click button': function () {
                navigator.geolocation.getCurrentPosition(
                    this.proxy('received_position'));
            }
        },
        start: function() {
            var sup = this._super();
            this.field_manager.on("field_changed:provider_latitude", this, this.display_map);
            this.field_manager.on("field_changed:provider_longitude", this, this.display_map);
            this.on("change:effective_readonly", this, this.display_map);
            this.display_map();
            return sup;
        },
        display_map: function() {
            this.$el.html(QWeb.render("WidgetCoordinates", {
                "latitude": this.field_manager.get_field_value("provider_latitude") || 0,
                "longitude": this.field_manager.get_field_value("provider_longitude") || 0,
            }));
            this.$("button").toggle(! this.get("effective_readonly"));
        },
        received_position: function(obj) {
            this.field_manager.set_values({
                "provider_latitude": obj.coords.latitude,
                "provider_longitude": obj.coords.longitude,
            });
        },
    });
    //endregion


    core.form_widget_registry.add('char2', FieldChar2)
    core.form_widget_registry.add('color', FieldColor)
    core.form_custom_registry.add('multiplication', WidgetMultiplication);
    core.form_custom_registry.add('coordinates', WidgetCoordinates);
    core.action_registry.add('petstore', homePage);

});
    function mapCall(mensaje) {
        var a = new messages_list("HOla");

        alert('Hola')
    }