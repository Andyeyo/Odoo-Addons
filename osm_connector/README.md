# Open Street Maps Connector with Odoo 13

[![Demo](https://github.com/Andyeyo/Odoo-Addons/blob/13.0/osm_connector/static/description/icon.png?raw=true)](https://youtu.be/nTxif11Dg1Y "Demo")    

Welcome to OpenStreetMap from Odoo 13, the project that creates and 
distributes free geographic data for the world. Now you can use the map 
from Odoo. This module brings four new features:
 - New view map allows user to view all addresses on open street maps `"osm_view"`
 - New widget enabled to set a point location `"osm"`
 

# OSM view  `"osm_view"`
Basically, this new view `osm_view`  will integrate Open Street Map into Odoo 13.    

There are three available attributes that you can customize
 - `lat`      : an attritube to tell the map the latitude field on the object __[mandatory]__
 - `lng`      : an attritute to tell the map the longitude field on the object __[mandatory]__
 - `polyline` : an attribute to show a polyline between markers __[optional]__.
 
 
### How to create the view?    
Example

![alt text](https://github.com/Andyeyo/Odoo-Addons/blob/13.0/osm_connector/static/description/osm_view.png?raw=true)


```xml
    <!-- View -->
    <record model="ir.ui.view" id="osm_connector.list">
        <field name="name">osm_connector list</field>
        <field name="model">osm_connector.demo</field>
        <field name="arch" type="xml">
            <osm_view polyline="true" string="Map" lat="lat" lng="lng">
                <field name="name"/>
                <field name="lat"/>
                <field name="lng"/>
                <templates>
                    <t t-name="kanban-box">
                        <div class="oe_kanban_global_click_edit oe_semantic_html_override">
                            <div t-attf-class="oe_kanban_content">
                                <field name="name"/>
                                <br/>
                                <field name="lat"/>
                                <br/>
                                <field name="lng"/>
                            </div>
                        </div>
                    </t>
                </templates>
            </osm_view>
        </field>
    </record>

    
    <!-- actions opening views on models -->

    <record model="ir.actions.act_window" id="osm_connector.action_window">
      <field name="name">Osm Example</field>
      <field name="res_model">osm_connector.demo</field>
      <field name="view_mode">tree,form,osm_view</field>
    </record>
```

The marker infowindow will use `kanban-box` kanban card style.    


# New widget `"osm"`

New widget has two options that can be modify:
 - `lat`
 - `lng`

### Latitude `lat` and Longitude `lng`
This options tell the widget the fields geolocation, in order to have this fields filled automatically.

### How to create the widget?    
Example

![alt text](https://github.com/Andyeyo/Odoo-Addons/blob/13.0/osm_connector/static/description/osm_widget.png?raw=true)

```xml
    <!-- View -->
    <field name="map" nolabel="1" widget="osm" lat="latitude" lng="longitude"/>
```