odoo.define('osm_widget.OsmMap', function (require) {
    "use strict";

    var core = require('web.core');
    var form_common = require('web.form_common');
    var Model = require('web.DataModel');
    var decimal;

    var OsmMap = form_common.AbstractField.extend({
            template: 'OsmMap',

            start: function () {

                var self = this;

                var result = new Model('res.lang')
                    .query(['decimal_point'])
                    .filter([['code', '=', self.session.user_context.lang]])
                    .limit(1)
                    .all()
                    .done(function (result) {
                        decimal = result[0].decimal_point;
                    })
                    .fail(function (result) {
                        alert(result);
                    });

                this.decimal = null;

                this.map = L.map(this.el).setView([-1.219762, -78.594042], 14);

                var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap by Andrés Ramos</a>';

                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; ' + mapLink,
                    maxZoom: 18,
                }).addTo(this.map);

                this.greenIcon = L.icon({
                    iconUrl: '/osm_widget/static/src/images/marker-icon.png',
                    shadowUrl: '/osm_widget/static/src/images/marker-shadow.png',

                    iconSize: [38, 52], // size of the icon
                    shadowSize: [50, 64], // size of the shadow
                    iconAnchor: [22, 53], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                });

                this.drawnItems = new L.FeatureGroup();

                this.map.addLayer(this.drawnItems);

                //region Translate
                L.drawLocal.draw.toolbar.buttons.polyline = 'Dibujar una polilínea';
                L.drawLocal.draw.toolbar.buttons.polygon = 'Dibujar un polígono';
                L.drawLocal.draw.toolbar.buttons.rectangle = 'Dibujar un rectángulo';
                L.drawLocal.draw.toolbar.buttons.circle = 'Dibujar un círculo';
                L.drawLocal.draw.toolbar.buttons.marker = 'Dibujar un marcador';

                L.drawLocal.draw.toolbar.actions.title = 'Cancelar dibujo';
                L.drawLocal.draw.toolbar.actions.text = 'Cancelar';

                L.drawLocal.draw.toolbar.finish.title = 'Finalizar dibujo';
                L.drawLocal.draw.toolbar.finish.text = 'Finalizar';

                L.drawLocal.draw.toolbar.undo.title = 'Eliminar el último punto dibujado';
                L.drawLocal.draw.toolbar.undo.text = 'Eliminar el último punto';

                L.drawLocal.draw.handlers.circle.tooltip.start = 'Haga clic y arrastre para dibujar un círculo.';
                L.drawLocal.draw.handlers.circle.radius = 'Radio';

                L.drawLocal.draw.handlers.circlemarker.tooltip.start = 'Haga clic en el mapa para colocar el marcador circular.';

                L.drawLocal.draw.handlers.marker.tooltip.start = 'Haz clic en el mapa para colocar el marcador.';

                L.drawLocal.draw.handlers.polygon.tooltip.start = 'Haga clic para comenzar a dibujar el polígono.';
                L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Haga clic para continuar con la forma del polígono.';
                L.drawLocal.draw.handlers.polygon.tooltip.end = 'Haga clic en el primer punto para cerrar este polígono.';

                L.drawLocal.draw.handlers.polyline.error = '<strong> Error: </strong> los bordes de la forma no se pueden cruzar.';
                L.drawLocal.draw.handlers.polyline.tooltip.start = 'Haga clic para comenzar a dibujar la línea.';
                L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Haga clic para continuar dibujando línea.';
                L.drawLocal.draw.handlers.polyline.tooltip.end = 'Haga clic en el último punto para terminar la línea.';

                L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Suelte el mouse para finalizar el dibujo.';

                L.drawLocal.edit.toolbar.actions.save.title = 'Guardar cambios.';
                L.drawLocal.edit.toolbar.actions.save.text = 'Guardar';

                L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar la edición, descarta todos los cambios.';
                L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';

                L.drawLocal.edit.toolbar.actions.clearAll.title = 'Limpiar todas las capas.';
                L.drawLocal.edit.toolbar.actions.clearAll.text = 'Limpiar todo';

                L.drawLocal.edit.toolbar.buttons.edit = 'Editar capas.';
                L.drawLocal.edit.toolbar.buttons.editDisabled = 'Sin capas para editar.';
                L.drawLocal.edit.toolbar.buttons.remove = 'Eliminar capas.';
                L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Sin capas para eliminar.';

                L.drawLocal.edit.handlers.edit.tooltip.text = 'Arrastra los controles o marcador para editar la función.';
                L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Haga clic en cancelar para deshacer los cambios.';

                L.drawLocal.edit.handlers.remove.tooltip.text = 'Haga clic en una característica para eliminar.';

                //endregion

                this.drawControl = new L.Control.Draw({
                    draw: {

                        polygon: {
                            shapeOptions: {
                                color: 'purple'
                            },
                        },
                        polyline: {
                            shapeOptions: {
                                color: 'red'
                            },
                        },
                        rect: {
                            shapeOptions: {
                                color: 'green'
                            },
                        },
                        circle: {
                            shapeOptions: {
                                color: 'steelblue'
                            },
                        },
                        marker: {
                            icon: self.greenIcon,
                        },
                    },
                    edit: {
                        featureGroup: self.drawnItems
                    }
                });

                this.map.addControl(this.drawControl);

                this.drawControlEditOnly = new L.Control.Draw({
                    edit: {
                        featureGroup: self.drawnItems
                    },
                    draw: false
                });

                this.map.on("draw:created", function (e) {
                    var layer = e.layer;
                    layer.addTo(self.drawnItems);
                    this.removeControl(self.drawControl)
                    this.addControl(self.drawControlEditOnly);

                    if (e.layerType === 'marker') {
                        var list = document.getElementsByClassName("o_form_label");
                        if (list.length > 0) {
                            for (var i = 0; i < list.length; i++) {
                                if (list[i].outerText == 'Longitude' || list[i].outerText == 'Longitud') {
                                    var lng = layer.getLatLng().lng.toString();
                                    if (!(decimal == null))
                                        lng = lng.replace(".", decimal);
                                    list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lng;
                                }

                                else if (list[i].outerText == 'Latitude' || list[i].outerText == 'Latitud') {
                                    var lat = layer.getLatLng().lat.toString();
                                    if (!(decimal == null))
                                        lat = lat.replace(".", decimal);
                                    list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lat;
                                }
                            }
                        }

                        layer.bindPopup('Position: ' + layer.getLatLng()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'marker',
                            position: layer.getLatLng()
                        }));
                    } else if (e.layerType === 'circle') {
                        layer.bindPopup('Position: ' + layer.getLatLng()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'circle',
                            position: layer.getLatLng(),
                            radius: layer.getRadius()
                        }));
                    } else if (e.layerType === 'polygon') {
                        layer.bindPopup('Position: ' + layer.getLatLngs()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'polygon',
                            position: layer.getLatLngs(),
                            center: layer.getBounds().getCenter()
                        }));
                    } else if (e.layerType === 'polyline') {
                        layer.bindPopup('Position: ' + layer.getLatLngs()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'polyline',
                            position: layer.getLatLngs(),
                            center: layer.getBounds().getCenter()
                        }));
                    } else if (e.layerType === 'rectangle') {
                        layer.bindPopup('Position: ' + layer.getLatLngs()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'rectangle',
                            position: layer.getLatLngs(),
                            center: layer.getBounds().getCenter()
                        }));
                    } else if (e.layerType === 'circlemarker') {
                        layer.bindPopup('Position: ' + layer.getLatLng()).openPopup();
                        self.internal_set_value(JSON.stringify({
                            shape: 'circlemarker',
                            position: layer.getLatLng(),
                            radius: layer.getRadius()
                        }));
                    }
                });

                this.map.on("draw:deleted", function (e) {
                    this.removeControl(self.drawControlEditOnly)
                    this.addControl(self.drawControl);
                    var list = document.getElementsByClassName("o_form_label");
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].outerText == 'Longitude' || list[i].outerText == 'Longitud') {
                                var lng = "0" + decimal + "000000";
                                list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lng;
                            }

                            else if (list[i].outerText == 'Latitude' || list[i].outerText == 'Latitud') {
                                var lat = "0" + decimal + "000000";
                                list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lat;
                            }
                        }
                    }
                    self.internal_set_value("");
                });

                this.map.on('draw:edited', function (e) {
                    var layers = e.layers;
                    layers.eachLayer(function (layer) {
                        if (layer instanceof L.Marker) {
                            var list = document.getElementsByClassName("o_form_label");
                            if (list.length > 0) {
                                for (var i = 0; i < list.length; i++) {
                                    if (list[i].outerText == 'Longitude' || list[i].outerText == 'Longitud') {
                                        var lng = layer.getLatLng().lng.toString();
                                        if (!(decimal == null))
                                            lng = lng.replace(".", decimal);
                                        list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lng;
                                    }

                                    else if (list[i].outerText == 'Latitude' || list[i].outerText == 'Latitud') {
                                        var lat = layer.getLatLng().lat.toString();
                                        if (!(decimal == null))
                                            lat = lat.replace(".", decimal);
                                        list[i].parentElement.parentElement.lastElementChild.firstElementChild.value = lat;
                                    }
                                }
                            }
                            layer.bindPopup(layer.getLatLng().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'marker',
                                position: layer.getLatLng()
                            }));
                        } else if (layer instanceof L.Circle) {
                            layer.bindPopup(layer.getLatLng().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'circle',
                                position: layer.getLatLng(),
                                radius: layer.getRadius()
                            }));
                        } else if (layer instanceof L.CircleMarker) {
                            layer.bindPopup(layer.getLatLng().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'circlemarker',
                                position: layer.getLatLng(),
                                radius: layer.getRadius()
                            }));
                        } else if (layer instanceof L.Rectangle) {
                            layer.bindPopup(layer.getLatLngs().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'rectangle',
                                position: layer.getLatLngs(),
                                center: layer.getBounds().getCenter()
                            }));
                        } else if (layer instanceof L.Polygon) {
                            layer.bindPopup(layer.getLatLngs().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'polygon',
                                position: layer.getLatLngs(),
                                center: layer.getBounds().getCenter()
                            }));
                        } else if (layer instanceof L.Polyline) {
                            layer.bindPopup(layer.getLatLngs().toString()).openPopup();
                            self.internal_set_value(JSON.stringify({
                                shape: 'polyline',
                                position: layer.getLatLngs(),
                                center: layer.getBounds().getCenter()
                            }));
                        }
                    });
                });

                window.dispatchEvent(new Event('resize'));

                $(window).on('hashchange', function () {
                    if (self.get_value()) {
                        if (self.drawControl._map) {
                            self.map.removeControl(self.drawControl);
                            self.map.addControl(self.drawControlEditOnly);
                        }
                    } else {
                        self.drawnItems.clearLayers();
                        if (self.drawControlEditOnly._map) {
                            self.map.removeControl(self.drawControlEditOnly);
                        }
                        if (!self.drawControl._map) {
                            self.map.addControl(self.drawControl);
                        }
                    }
                });

                this.on('change:effective_readonly', this, this.update_mode);

                this._super();
            },

            render_value: function () {
                if (this.get_value()) {
                    if (this.drawControl._map) {
                        this.map.removeControl(this.drawControl);
                    }
                    if (JSON.parse(this.get_value()).shape == 'marker') {
                        this.drawnItems.clearLayers();
                        var obj = JSON.parse(this.get_value()).position;
                        L.marker(JSON.parse(this.get_value()).position,
                            {
                                icon: this.greenIcon
                            }
                        )
                            .bindPopup("Position: LatLng(" + obj.lat.toString().substr(1, 8) + ", " + obj.lng.toString().substr(1, 8) + ")")
                            .openPopup()
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).position, 14);
                    } else if (JSON.parse(this.get_value()).shape == 'circle') {
                        this.drawnItems.clearLayers();
                        var obj = JSON.parse(this.get_value()).position;
                        L.circle(JSON.parse(this.get_value()).position, JSON.parse(this.get_value()).radius)
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).position, 14);
                    } else if (JSON.parse(this.get_value()).shape == 'circlemarker') {
                        this.drawnItems.clearLayers();
                        var obj = JSON.parse(this.get_value()).position;
                        L.circleMarker(JSON.parse(this.get_value()).position, {color: 'red'})
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).position, 14);
                    } else if (JSON.parse(this.get_value()).shape == 'polygon') {
                        this.drawnItems.clearLayers();
                        L.polygon(JSON.parse(this.get_value()).position, {color: 'red'})
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).center, 14);
                    }
                    else if (JSON.parse(this.get_value()).shape == 'polyline') {
                        this.drawnItems.clearLayers();
                        L.polyline(JSON.parse(this.get_value()).position, {color: 'red'})
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).center, 14);
                    }
                    else if (JSON.parse(this.get_value()).shape == 'rectangle') {
                        this.drawnItems.clearLayers();
                        L.rectangle(JSON.parse(this.get_value()).position, {color: 'red'})
                            .addTo(this.drawnItems);
                        this.map.setView(JSON.parse(this.get_value()).center, 14);
                    }
                }
            },

            update_mode: function () {
                if (!this.get("effective_readonly") && this.get_value()) {
                    this.map.addControl(this.drawControlEditOnly);
                } else if (this.drawControlEditOnly._map) {
                    this.map.removeControl(this.drawControlEditOnly);
                }
            },

        })
    ;

    core.form_widget_registry.add('osm_map', OsmMap);

    return {
        OsmMap: OsmMap,
    };
});