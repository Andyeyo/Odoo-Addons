odoo.define('oepetstore.FieldMap', function (require) {
    "use strict";

    var core = require('web.core');
    var form_common = require('web.form_common');
    var last_value;
    var selectedShape;
    var all_overlays = []
    var selectedColor;
    var drawingManager;

    var FieldMap = form_common.AbstractField.extend({
        template: 'FieldMap',
        start: function () {
            var self = this;


            //Construye una variable "map"
            this.map = new google.maps.Map(this.el, {
                center: {lat: -2.0000000, lng: -77.5000000},
                zoom: 8,
                // disableDefaultUI: true,
            });

            //Construye una herramienta para dibujar
            this.drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [/*'marker', */'circle', 'polygon', 'polyline', 'rectangle']
                },
                //markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
                circleOptions: {
                    fillColor: '#EFF8FB',
                    // fillOpacity: 1,
                    strokeWeight: 5,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                }
            });
            this.drawingManager.setMap(this.map);

            //This method is used for the geofences building
            drawingManager = this.drawingManager;
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
                if (event.type == 'circle') {
                    var radius = event.overlay.getRadius();
                    var center = event.overlay.getCenter();
                    self.marker.setPosition(center);
                    self.marker.setMap(self.map);
                    self.internal_set_value(JSON.stringify({
                        position: self.marker.getPosition(),
                        zoom: self.map.getZoom(),
                        shape: 'circle',
                        radius: radius
                    }));
                    document.getElementById('o_field_input_3').value = self.marker.getPosition().lat();
                    document.getElementById('o_field_input_4').value = self.marker.getPosition().lng();
                }
                all_overlays.push(event);
                drawingManager.setOptions({
                    drawingControl: false,
                    drawingMode: null,
                });
            });


            //Construye un marcador
            this.marker = new google.maps.Marker({
                position: {lat: -1.286186915711467, lng: -78.4613037109375},
            });

            this.draw_circle = new google.maps.Circle({
                center: {lat: -1.286186915711467, lng: -78.4613037109375},
                radius: 10,
                fillColor: '#EFF8FB',
                // fillOpacity: 1,
                strokeWeight: 5,
                clickable: false,
                editable: true,
                zIndex: 1,
                map: null
            });

            /*Click sobre el mapa para editar el marker*/
            this.map.addListener('click', function (e) {
                //alert('Click sobre el mapa' + '\n' + 'Editar: ' + !self.get("effective_readonly") + '\n' + 'Si: Setea' + '\n' + 'No: Sale del metodo');
                if (!self.get("effective_readonly") && self.marker.getMap() == null) {
                    self.marker.setPosition(e.latLng);
                    self.marker.setMap(self.map);
                    self.internal_set_value(JSON.stringify({
                        position: self.marker.getPosition(),
                        zoom: self.map.getZoom()
                    }));

                    // Check the field name $('#name')

                    document.getElementById('o_field_input_3').value = self.marker.getPosition().lat();
                    document.getElementById('o_field_input_4').value = self.marker.getPosition().lng();
                }
            });

            // Es el zoom del mapa (Cuando no es editable no permite el zoom)
            this.map.addListener('zoom_changed', function () {
                if (!self.get("effective_readonly") && self.marker.getMap()) {
                    if (self.draw_circle.getMap()) {
                        var shape = 'circle';
                        var radius = self.draw_circle.getRadius();
                    }

                    self.internal_set_value(JSON.stringify({
                        position: self.marker.getPosition(),
                        zoom: self.map.getZoom(),
                        shape: shape,
                        radius: radius
                    }));
                }
            });

            // Click sobre el marker
            this.marker.addListener('click', function () {
                //alert('Click sobre el Marker' + '\n' + 'Editar: ' + !self.get("effective_readonly") + '\n' + 'Si: Borra' + '\n' + 'No: Set Lat y Long');
                if (!self.get("effective_readonly")) {
                    self.marker.setMap(null);
                    self.internal_set_value(false);
                    document.getElementById('o_field_input_3').value = '0.00';
                    document.getElementById('o_field_input_4').value = '0.00';
                }
            });


            this.marker.addListener('dragend', function () {
                self.internal_set_value(JSON.stringify({
                    position: self.marker.getPosition(),
                    zoom: self.map.getZoom()
                }));
                document.getElementById('o_field_input_3').value = self.marker.getPosition().lat();
                document.getElementById('o_field_input_4').value = self.marker.getPosition().lng();
            });


            this.getParent().$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
                self.trigger('resize');
            });

            this.getParent().on('attached', this.getParent(), function () {
                self.trigger('resize');
            });

            this.on('change:effective_readonly', this, this.update_mode);

            this.on('resize', this, this._toggle_label);
            // this.update_mode();
            this._super();
        },

        deleteAllShape: function () {
            for (var i = 0; i < all_overlays.length; i++) {
                all_overlays[i].overlay.setMap(null);
            }
            all_overlays = [];
        },

        //To show if it has values
        render_value: function () {
            //alert('render_value  Tiene valores: \n' + this.get_value() + '\n' + this.get("effective_readonly"));
            if (this.get_value()) {
                this.marker.setPosition(JSON.parse(this.get_value()).position);
                this.map.setCenter(JSON.parse(this.get_value()).position);
                this.map.setZoom(JSON.parse(this.get_value()).zoom);
                this.marker.setMap(this.map);
                if (this.get("effective_readonly")) {
                    // To hide:
                    this.drawingManager.setOptions({
                        drawingControl: false
                    });
                    this.drawingManager.setDrawingMode(null);
                }


                if (JSON.parse(this.get_value()).shape == 'circle') {
                    this.draw_circle.setMap(this.map);
                    this.draw_circle.setCenter(JSON.parse(this.get_value()).position);
                    this.draw_circle.setRadius(JSON.parse(this.get_value()).radius);
                    this.drawingManager.setOptions({
                        drawingControl: false
                    });
                    this.drawingManager.setDrawingMode(null);
                }
                else {
                    this.draw_circle.setMap(null);
                    if (!this.get("effective_readonly")) {
                        this.drawingManager.setOptions({
                            drawingControl: true,
                            drawingMode: null,
                        });
                    }
                }

                // if (document.getElementById('boton')) {
                //     alert('SI');
                //     document.getElementById('boton').addEventListener("click", function () {
                //         alert('creado')
                //         all_overlays.push(this.draw_circle);
                //         for (var i = 0; i < all_overlays.length; i++) {
                //             all_overlays[i].overlay.setMap(null);
                //         }
                //         all_overlays = [];
                //     });
                // }
            }
            else {
                // this.marker.setPosition({lat: -2.0000000, lng: -77.5000000});
                // this.drawingManager.setMap(null);
                this.deleteAllShape();
                this.draw_circle.setMap(null);
                this.marker.setMap(null);
                this.map.setCenter({lat: -2.0000000, lng: -77.5000000});
                this.map.setZoom(8);
                if (this.get("effective_readonly")) {
                    // To hide:
                    this.drawingManager.setOptions({
                        drawingControl: false
                    });
                    this.drawingManager.setDrawingMode(null);
                }
                else {
                    // To show:
                    this.drawingManager.setOptions({
                        drawingControl: true,
                        drawingMode: null,
                    });
                }
            }
        },

        /* Este metodo es para controlar cuando se pone EDITAR y GUARDAR*/
        update_mode: function () {
            //alert('update_mode \n' + 'Opcion:' + this.get("effective_readonly") + '\n' + 'True: Editar' + '\n' + 'False: Guardar')
            // this.last_val
            if (this.get("effective_readonly")) {
                this.map.setOptions({
                    disableDoubleClickZoom: true,
                    draggable: false,
                    scrollwheel: false,
                });
                this.marker.setOptions({
                    draggable: false,
                    cursor: 'pointer',
                });
            } else {
                this.map.setOptions({
                    disableDoubleClickZoom: false,
                    draggable: true,
                    scrollwheel: true,
                });
                this.marker.setOptions({
                    draggable: true,
                    cursor: 'pointer',
                });
            }
        },

        //Sirve para la etiquetacion
        _toggle_label: function () {
            // alert('Evento _toggle_label')
            this._super();
            google.maps.event.trigger(this.map, 'resize');
            if (!this.no_rerender) {
                this.render_value();
            }
        },

    });

    core.form_widget_registry.add('map', FieldMap);

    return {
        FieldMap: FieldMap,
    };

});