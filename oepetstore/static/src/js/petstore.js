odoo.define('oepetstore.petstore', function (require) {
"use strict";
    var Class = require('web.Class');
    var Widget = require('web.Widget');
    var core = require('web.core');
    var QWeb = core.qweb;
    var utils = require('web.utils');
    var _t = core._t;
    var _lt = core._lt;

    var homePage = Widget.extend({
        //template: "HomePageTemplate", // Se puede ocupar en vez del QWeb.render, SE codifica en el init
        className: 'oe_petstore_homepage',
        init: function(parent) {
            this._super(parent); // This command is used to inherit the init method parent
            console.log("Hello JS, I'm inside of init.");
            //this.name = "Andres Ramos";
        },
        start: function() {
            //console.log("Your pet store home page loaded");
            //this.$el.append("<div>Hello dear Odoo user!</div>"); // $el represents the section of page they're in charge of (as a jQuery object).
            //var greeting = new GreetingsWidget(this);
            //return greeting.appendTo(this.$el); // appendTo call the start function of GreetingsWidget
                                                //greeting es el contenido a agregar
                                                //this.$el donde se va a agregar por lo general al final
            // this.$el.append(QWeb.render("HomePageTemplate"));
            //var person = prompt("Please enter your name", "Harry Potter");
            //this.$el.append(QWeb.render("HomePageTemplate", {name: person})); se ocupa sin el template
            var products = new ProductsWidget(
                this, ["cpu", "mouse", "keyboard", "graphic card", "screen"], "#00FF00");
            products.appendTo(this.$el);
        },
    });

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

    //core.view_registry.add('petstore', homePage);
    core.action_registry.add('petstore', homePage);
});