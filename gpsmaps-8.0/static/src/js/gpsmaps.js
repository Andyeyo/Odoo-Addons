openerp.gpsmaps_var                     ={};
openerp.gpsmaps_var.locations           =Array();
openerp.gpsmaps_var.posicion            =Array();
openerp.gpsmaps_var.posicion_street     =Array();
openerp.gpsmaps_var.posiciones          =Array();
openerp.gpsmaps_var.geofence            =Array();
openerp.gpsmaps_var.geofences           =Array();
openerp.gpsmaps_var.otras_locations     =Array();
openerp.gpsmaps_var.vehiculos           =Array();
openerp.gpsmaps_var.vehiculo            =undefined;
openerp.gpsmaps_var.ejecutando          =0;
openerp.gpsmaps_var.detener             =0;
openerp.gpsmaps_var.refposiciones       =Array();
openerp.gpsmaps_var.menu_vehicle        ="";
openerp.gpsmaps_var.map;
openerp.gpsmaps_var.google;
openerp.gpsmaps_var.ObjetoOdoo;
openerp.gpsmaps_var.geocoder;
openerp.gpsmaps_var.vreturn;



openerp.gpsmaps = function(instance, local) 
{
    var _t      = instance.web._t,
        _lt     = instance.web._lt;
    var QWeb    = instance.web.qweb;

    local.HomePage = instance.Widget.extend({
    	template: "gpsmaps_map",
        start: function() 
        {   
            var objeto=this;
		    var locations=Array();
		    var timer_position;
		    var location;
		    var map;
        
            ObjetoOdoo                  =new local.gpsmaps();
            
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();
            $("#odometro").hide();

            coordinates	                ={latitude:19.057522756727606,longitude:-104.29785901920393};              
            map			                =ObjetoOdoo.CreateMap(13, "ROADMAP", coordinates, "map");	
            ObjetoOdoo.geofence(map);
            

            setTimeout(function()
            {   
                objeto.process(ObjetoOdoo, map);
            },100);                         
            setTimeout(function()
            {   
                objeto.process(ObjetoOdoo, map);
            },500);                         
            
            timer_position=setInterval(function()
            {     
                objeto.process(ObjetoOdoo, map);
            },10000);
            
            if(openerp.gpsmaps_var.refposiciones.length>1)  openerp.gpsmaps_var.refposiciones.push(timer_position);
            else                                            openerp.gpsmaps_var.refposiciones[1]=timer_position;
                        
            ObjetoOdoo.menu_vehicle();
        },
        process: function(ObjetoOdoo, map) 
        {   
		    var locations=Array();
		    var timer_position;
		    var location;

            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posicion);
            ObjetoOdoo.positions(map);
            for(ivehiculo in openerp.gpsmaps_var.posicion)
            {                                     
                var vehiculo        =openerp.gpsmaps_var.posicion[ivehiculo];
                var data_vehiculo   =openerp.gpsmaps_var.vehiculos[ivehiculo];
                
                if(data_vehiculo != undefined) 
                {
                    if(data_vehiculo["image_gps"] != undefined)  vehiculo["image_gps"]   =data_vehiculo["image_gps"];    
                    
                    location        =ObjetoOdoo.locationsMap(map, {latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]}, "aaaa", vehiculo);                    
                    if(openerp.gpsmaps_var.locations[ivehiculo]==undefined)     openerp.gpsmaps_var.locations[ivehiculo]=Array(location);
                    else                                                        openerp.gpsmaps_var.locations[ivehiculo].push(location);                                            
                }    
            }
        }        
    });
    instance.web.client_actions.add('gpsmaps.homepage', 'instance.gpsmaps.HomePage');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    local.history = instance.Widget.extend({
    	template: "gpsmaps_history",
        start: function() 
        {   
            var objeto=this;
		    var locations=Array();
		    var timer_position;
		    
		    var map;
        
            ObjetoOdoo                      =new local.gpsmaps();
            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posicion);
            ObjetoOdoo.del_locations_otras();           
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();

            $("#odometro").hide();

            coordinates	                    ={latitude:19.057522756727606,longitude:-104.29785901920393};              
            map			                    =ObjetoOdoo.CreateMap(13, "ROADMAP", coordinates, "map");	                                   
            
            ObjetoOdoo.geofence(map);            
            openerp.gpsmaps_var.map         =map;
            ObjetoOdoo.menu_vehicle();
        },
        search_history: function(ObjetoOdoo,map,search,time) 
        {   
            objeto = this;            
            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);            
            ObjetoOdoo.del_locations_otras();                        
            ObjetoOdoo.del_array();            
            ObjetoOdoo.positions_history(map,search);            
            objeto.execute_history(ObjetoOdoo,map,search,time);            
        },
        execute_history: function(ObjetoOdoo,map,search,time) 
        {   
            objeto = this;
            openerp.gpsmaps_var.detener=1;
            if(openerp.gpsmaps_var.posiciones.length>0)
            {
                openerp.gpsmaps_var.detener=0;
                objeto.paint_history(ObjetoOdoo,map,search, 1,time);
            }
            else
            {
                setTimeout(function()
                {   
                    objeto.execute_history(ObjetoOdoo,map,search,time);
                },1000);
            }
        },
        paint_history: function(ObjetoOdoo,map,search, position,time) 
        {   
            $("#odometro").show();
            objeto = this;
            var location;

            if(time==0)
            {            
                for(ivehiculo in openerp.gpsmaps_var.posiciones)
                {         
                    var vehiculo        =openerp.gpsmaps_var.posiciones[ivehiculo];
                    var data_vehiculo   =openerp.gpsmaps_var.vehiculos[openerp.gpsmaps_var.vehiculo];      
                    
                    if(data_vehiculo != undefined) 
                    {
                        if(data_vehiculo["image_gps"] != undefined)  vehiculo["image_gps"]   =data_vehiculo["image_gps"];                        
                        location        =ObjetoOdoo.locationsMap( map, {latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]}, "aaaa", vehiculo);                    
                        if(openerp.gpsmaps_var.locations[ivehiculo]==undefined)     openerp.gpsmaps_var.locations[ivehiculo]=Array(location);
                        else                                                        openerp.gpsmaps_var.locations[ivehiculo].push(location);                                                                
                    }
                } 
            }
            else
            {
                ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);
                
                if(openerp.gpsmaps_var.posiciones.length>0 && openerp.gpsmaps_var.detener==0)
                {
                    var vehiculo        =openerp.gpsmaps_var.posiciones[position];
                    var data_vehiculo   =openerp.gpsmaps_var.vehiculos[openerp.gpsmaps_var.vehiculo];                    
                    if(data_vehiculo != undefined) 
                    {
                        if(data_vehiculo["image_gps"] != undefined)  vehiculo["image_gps"]   =data_vehiculo["image_gps"];                                                
                        location        =ObjetoOdoo.locationsMap( map, {latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]}, "aaaa", vehiculo);                        
                        if(openerp.gpsmaps_var.locations[position]==undefined)     openerp.gpsmaps_var.locations[position]=Array(location);
                        else                                                        openerp.gpsmaps_var.locations[position].push(location);                                                                                        
                        if(openerp.gpsmaps_var.posiciones.length -1 > position)
                        {                
                            time_aux=time;
                            if(vehiculo["speed"]==0) 
                            {   
                                time_aux=0;
                                location        =ObjetoOdoo.locationsMap( map, {latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]}, "aaaa", vehiculo);
                                
                                if(openerp.gpsmaps_var.otras_locations==undefined)     openerp.gpsmaps_var.otras_locations=Array(location);
                                else                                                   openerp.gpsmaps_var.otras_locations.push(location);                               
                            }
                            setTimeout(function()
                            {                                               
                                position=position+1;
                                objeto.paint_history(ObjetoOdoo,map,search, position,time);                    
                            },time_aux);
                        }    
                    }
                }
            }

        }        
    });
    instance.web.client_actions.add('gpsmaps.history', 'instance.gpsmaps.history');
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    local.history_street = instance.Widget.extend({
        template: "gpsmaps_street_history",
        start: function() 
        {   
            var objeto=this;
		    var locations=Array();
		    var timer_position;
		    
		    var map;
        
            ObjetoOdoo                      =new local.gpsmaps();
            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posicion);
            ObjetoOdoo.del_locations_otras();           
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();

            $("#odometro").hide();

            coordinates	                    ={latitude:19.057522756727606,longitude:-104.29785901920393};              
            map			                    =ObjetoOdoo.CreateMap(13, "ROADMAP", coordinates, "map");	                                   
            
            ObjetoOdoo.geofence(map);            
            openerp.gpsmaps_var.map         =map;
            ObjetoOdoo.menu_vehicle();
        },
        search_history: function(ObjetoOdoo,map,search,time) 
        {   
            objeto = this;            
            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);            
            ObjetoOdoo.del_locations_otras();                        
            ObjetoOdoo.del_array();            
            ObjetoOdoo.positions_history(map,search);            
            objeto.execute_history(ObjetoOdoo,map,search,time);            
        },
        execute_history: function(ObjetoOdoo,map,search,time) 
        {   
            if($('#street').length)
            {        
                objeto = this;
                openerp.gpsmaps_var.detener=1;
                if(openerp.gpsmaps_var.posiciones.length>0)
                {
                    openerp.gpsmaps_var.detener=0;
                    objeto.paint_history(ObjetoOdoo,map,search, 1,time);
                }
                else
                {
                    setTimeout(function()
                    {   
                        objeto.execute_history(ObjetoOdoo,map,search,time);
                    },3000);
                }
            }
        },
        paint_history: function(ObjetoOdoo,map,search, position,time) 
        {
     
   
                $("#odometro").show();
                objeto = this;
                var location;
                var coordinates;
                
                if(time==0)
                {            
                    for(ivehiculo in openerp.gpsmaps_var.posiciones)
                    {         
                        var vehiculo        =openerp.gpsmaps_var.posiciones[ivehiculo];
                        var data_vehiculo   =openerp.gpsmaps_var.vehiculos[openerp.gpsmaps_var.vehiculo];      
                        
                        if(data_vehiculo != undefined) 
                        {
                            if(data_vehiculo["image_gps"] != undefined)  vehiculo["image_gps"]   =data_vehiculo["image_gps"];                        
                            
                            coordinates={latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]};
                            location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa", vehiculo);                    
                            if(openerp.gpsmaps_var.locations[ivehiculo]==undefined)     openerp.gpsmaps_var.locations[ivehiculo]=Array(location);
                            else                                                        openerp.gpsmaps_var.locations[ivehiculo].push(location);                                                                
                        }
                    } 
                }
                else
                {
                    ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);
                    
                    if(openerp.gpsmaps_var.posiciones.length>0 && openerp.gpsmaps_var.detener==0)
                    {
                        var vehiculo        =openerp.gpsmaps_var.posiciones[position];
                        coordinates         ={latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]};
                        
                        var data_vehiculo   =openerp.gpsmaps_var.vehiculos[openerp.gpsmaps_var.vehiculo];                    
                        if(data_vehiculo != undefined) 
                        {
                            if(data_vehiculo["image_gps"] != undefined)  vehiculo["image_gps"]   =data_vehiculo["image_gps"];                                                
                            location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa", vehiculo);                        
                            if(openerp.gpsmaps_var.locations[position]==undefined)     openerp.gpsmaps_var.locations[position]=Array(location);
                            else                                                        openerp.gpsmaps_var.locations[position].push(location);                                                                                        
                            if(openerp.gpsmaps_var.posiciones.length -1 > position)
                            {                
                                time_aux=time;
                                if(vehiculo["speed"]==0) 
                                {   
                                    time_aux=0;
                                    location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa", vehiculo);
                                    
                                    if(openerp.gpsmaps_var.otras_locations==undefined)     openerp.gpsmaps_var.otras_locations=Array(location);
                                    else                                                   openerp.gpsmaps_var.otras_locations.push(location);                               
                                }
                                setTimeout(function()
                                {                                               
                                    position=position+1;
                                    objeto.paint_history(ObjetoOdoo,map,search, position,time);                    
                                    //objeto.street(ObjetoOdoo, map);
                                    ObjetoOdoo.streetMap( map, coordinates, vehiculo);
                                },time_aux);
                            }    
                        }
                    }
                }
        }            
    });
    instance.web.client_actions.add('gpsmaps.history_street', 'instance.gpsmaps.history_street');
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    local.mapForm = instance.Widget.extend({
        start: function(id) 
        {
            var objeto = this;
            ObjetoOdoo      =new local.gpsmaps();
            
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();            
        
            var obj_positions	= new instance.web.Model('gpsmaps.positions')
                .query(['address', 'latitude', 'longitude', 'course', 'speed', 'batery', 'milage','times','event_id','geofence_id'])
                .filter([['id', '=', id]])
                .limit(1)
                .order_by('-times')
                .all()
                .then(function (results) {
                    _(results).each(function (item) 
                    { 
		                var locations=Array();
		                var timer_position;
		                var location;
                        
                        map			=ObjetoOdoo.CreateMap(16, "ROADMAP", {latitude:item["latitude"],longitude:item["longitude"]}, "map2");	                        
                    	location    =ObjetoOdoo.locationsMap( map, {latitude:item["latitude"],longitude:item["longitude"]}, "aaaa", item["course"]);
                    	ObjetoOdoo.geofence(map);
                    });
                });
           
        }
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    local.geofence = instance.Widget.extend({
        start: function() 
        {
            objeto = this;
            ObjetoOdoo                      =new local.gpsmaps();
            openerp.gpsmaps_var.ObjetoOdoo  =ObjetoOdoo;
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();            

            
            coordinates	        ={latitude:19.057522756727606,longitude:-104.29785901920393};  
            map			        =ObjetoOdoo.CreateMap(16, "ROADMAP", coordinates, "map3");

            ObjetoOdoo.geofence(map);
            
	        google.maps.event.addListener(map, 'click', function(event) 
	        { 		          
		        var elon = new String(event.latLng.lng());
		        var elat = new String(event.latLng.lat());
                var location;
                
		        coordinates	={latitude:elat,longitude:elon};
		      
		        location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa",undefined,"marker");		
		        if(openerp.gpsmaps_var.otras_locations.length>0)   
		        {
		            openerp.gpsmaps_var.otras_locations.push(location);

		            ObjetoOdoo.del_locations_otras();
		            location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa",undefined,"marker");		    
		            openerp.gpsmaps_var.otras_locations=Array(location);		            
		        }    
		        else  openerp.gpsmaps_var.otras_locations=Array(location);

                ObjetoOdoo.ageofence(map,coordinates);                
                if(openerp.gpsmaps_var.geofence.length>0)       ObjetoOdoo.poliline(map,openerp.gpsmaps_var.geofences);

                objeto.points();                
	        });
	        return map;            
        },
        codeAddress: function (map,address) 
        {            
            var ObjetoOdoo=openerp.gpsmaps_var.ObjetoOdoo;
            ObjetoOdoo.codeAddress(map,address);
        },        
        points: function() 
        {                 
            var points;
            for(ipoint in openerp.gpsmaps_var.geofence)
            {
                var coordinates	=openerp.gpsmaps_var.geofence[ipoint];
                
                if(points==undefined)   points=coordinates.latitude + "," + coordinates.longitude;
                else                    points=points + ";" + coordinates.latitude + "," + coordinates.longitude;
            }
            if(openerp.gpsmaps_var.geofence.length>2)   
            {
                var coordinates	=openerp.gpsmaps_var.geofence[0];
                
                if(points==undefined)   points=coordinates.latitude + "," + coordinates.longitude;
                else                    points=points + ";" + coordinates.latitude + "," + coordinates.longitude;            
            }
            $("span.points input").val(points);            
        }   
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    local.mapa = instance.Widget.extend({
    	template: "gpsmaps_street",
        start: function() 
        {     
            openerp.gpsmaps_var.posicion_street     =Array();
		    var locations=Array();
		    var timer_position;
		    var location;
		    var map;
		    var tiempo=500;
        
            ObjetoOdoo      =new local.gpsmaps();
            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posicion);
            ObjetoOdoo.del_locations_otras();
            ObjetoOdoo.del_array();
            ObjetoOdoo.clearTimer();
            ObjetoOdoo.vehicles();
            //google      =openerp.gpsmaps_var.google;
            coordinates	    ={latitude:19.057522756727606,longitude:-104.29785901920393};  
            
            map			    =ObjetoOdoo.CreateMap(13, "ROADMAP", coordinates, "map");	
            ObjetoOdoo.positions(map);
            this.street(ObjetoOdoo, map);

                                    
            ObjetoOdoo.menu_vehicle();
        },	
        street: function(ObjetoOdoo, map) 
        {
            if($('#street').length)
            {     
                var location;
                var tiempo=500;
                var objeto=this;
                setTimeout(function()
                { 
                    var vehiculo="";
                    if(openerp.gpsmaps_var.vehiculo==undefined)          
                    {
                        vehiculo="";
                        vehiculo=vehiculo+"<div class=\"oe_view_nocontent\">";
                        vehiculo=vehiculo+"Debes seleccionar un vehiculo para realizar el StreetView";
                        vehiculo=vehiculo+"</div>";                
                        $("#street").html(vehiculo);
                        tiempo=500;
                    }    
                    else
                    {               
                        if($("#street").html()==vehiculo)
                        {
                            tiempo=20000;
                            vehiculo="";
                            vehiculo=vehiculo+"<div class=\"oe_view_nocontent\">";
                            vehiculo=vehiculo+"Lo sentimos<br>No tenemos imagenes para el StreetView en esta posicion.";
                            vehiculo=vehiculo+"</div>";
                            vehiculo=vehiculo+"";                    
                            $("#street").html(vehiculo);
                        }
                        else    
                        {         
                            tiempo=20000;
                            ObjetoOdoo.del_locations(openerp.gpsmaps_var.posicion);
                            ObjetoOdoo.positions(map);
                            for(ivehiculo in openerp.gpsmaps_var.posicion)
                            {                                     
                                var vehiculo    =openerp.gpsmaps_var.posicion[ivehiculo];
                                
                                var coordinates ={latitude:vehiculo["latitude"],longitude:vehiculo["longitude"]};                            
                                location        =ObjetoOdoo.locationsMap( map, coordinates, "aaaa", vehiculo);                    
                                ObjetoOdoo.streetMap( map, coordinates, vehiculo);                                                
                            }
                        }
                    }
                    objeto.street(ObjetoOdoo, map);
                },tiempo);
            
            }          
        }   		
    });
    instance.web.client_actions.add('gpsmaps.mapa', 'instance.gpsmaps.mapa');


    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    local.gpsmaps = instance.Widget.extend({
        start: function() 
        {     
    
        },
        CreateMap: function(iZoom,iMap,coordinates,object) 
        {					
            //openerp.gpsmaps_var.vgoogle =google;
            var map;
			if(iMap=="ROADMAP")	            var tMap = google.maps.MapTypeId.ROADMAP;
			if(iMap=="HYBRID")	            var tMap = google.maps.MapTypeId.HYBRID;								
			var position		            =this.LatLng(coordinates);

			var mapOptions 		            = new Object();
			
			if(iZoom!="")		            mapOptions.zoom			=iZoom;
			if(position!="")	            mapOptions.center		=position;
			if(iMap!="")		            mapOptions.mapTypeId	=tMap;	    
			map 				            = new google.maps.Map(document.getElementById(object), mapOptions);		
			openerp.gpsmaps_var.map         =map;
			openerp.gpsmaps_var.geocoder    = new google.maps.Geocoder();
			return map; 			
        },
		LatLng: function(coordinates)  
		{
			var position 		= new google.maps.LatLng(coordinates.latitude,coordinates.longitude);		
			return position;
		},
		menu_vehicle: function()  
		{
            ObjetoOdoo      =this;		    
            setTimeout(function()
            { 
		        var vehiculos       =openerp.gpsmaps_var.vehiculos;
		        var menu_vehiculo   ="";
		        var opcion_vehiculo ="";
		        
		        if(vehiculos.length>0)
		        {
		            for(ivehiculos in vehiculos)
		            {
		                var vehiculo    =vehiculos[ivehiculos];		                
                        var vehiculo_id =vehiculo["id"];

		                var vmodelo     =String(vehiculo["model_id"]);		geocoder = new google.maps.Geocoder();        
		                var modelo      =vmodelo.split(",");

			            var image="01";
			            if(!(vehiculo["image_gps"]==undefined || vehiculo["image_gps"]==false))
			            {
			                image=vehiculo["image_gps"];
			            }			
			            icon="/gpsmaps/static/src/img/vehiculo_" +image+ "/i135.png";
			            var driver="";
			            if(vehiculo["driver_id"]!=false)
			            {
			                var sdriver     =String(vehiculo["driver_id"]);
			                var vdriver     =sdriver.split(",");
			                driver          =vdriver[1];
			            }
		                opcion_vehiculo =opcion_vehiculo+"<li class=\"vehicle\" vehicle=\""+vehiculo_id+"\" style=\"padding-left:15px; padding-top:5px; padding-bottom:5px;\"><table><tr><td height=\"35\" width=\"50\" align=\"center\"><img src=\"" +icon+ "\"></td><td>" + modelo[1] + " <br>" + vehiculo["license_plate"]+"<br>"+driver+"</td></tr></table></li>";
		            }	
		            
		            if(!$("ul#menu_vehicles").length)	      
		            {
		                opcion_vehiculo ="<li class=\"vehicle vehicle_active\" vehicle=\"0\" style=\"padding-left:15px; padding-top:5px; padding-bottom:5px;\"><table><tr><td height=\"25\" width=\"50\" align=\"center\"></td><td>Todos los vehiculos</td></tr></table></li>"+opcion_vehiculo;
		                
		                var script_js   ="<script>";
		                script_js       =script_js+"$(\"#vehiculos\").click(function()";
		                script_js       =script_js+"{";
		                //script_js       =script_js+"alert(    $(\"#menu_vehicles\").attr(\"style\")   );";
		                //script_js       =script_js+"        $(\"#menu_vehicles\").attr({\"style\":\"display:block;\"});";


		                script_js       =script_js+"    if(  $(\"#menu_vehicles\").attr(\"style\") == \"display:none;\" )";
		                script_js       =script_js+"    {";
		                script_js       =script_js+"        $(\"#menu_vehicles\").attr({\"style\":\"display:block;\"});";
		                script_js       =script_js+"    }";
		                script_js       =script_js+"    else";
		                script_js       =script_js+"    {";
		                script_js       =script_js+"        $(\"#menu_vehicles\").attr({\"style\":\"display:none;\"});";
		                script_js       =script_js+"    }";

		                script_js       =script_js+"";
		                script_js       =script_js+"";
		                script_js       =script_js+"});";

		                
		                script_js       =script_js+"$(\"li.vehicle\").click(function(){";
		                script_js       =script_js+"$(\"li.vehicle\").removeClass(\"vehicle_active\");";    
		                script_js       =script_js+"$(this).addClass(\"vehicle_active\");";
		                script_js       =script_js+"var id_vehicle                  =$(this).attr(\"vehicle\");";
		                
		                //script_js       =script_js+"alert(id_vehicle);";
		                		                
		                script_js       =script_js+"if(id_vehicle==0) ";
		                script_js       =script_js+"{";
		                script_js       =script_js+"    openerp.gpsmaps_var.vehiculo=undefined;";
		                script_js       =script_js+"    $(\"#odometro\").hide();";
		                script_js       =script_js+"}";
		                script_js       =script_js+"else";
		                script_js       =script_js+"{";
                        script_js       =script_js+"    openerp.gpsmaps_var.vehiculo    =id_vehicle;";
		                script_js       =script_js+"    if(openerp.gpsmaps_var.posicion[id_vehicle]!=undefined)";
		                script_js       =script_js+"    {";
		                script_js       =script_js+"        $(\"#odometro\").show();";
		                script_js       =script_js+"        $(\"#tablero\").html(\"Cargando datos\");";		                

		                script_js       =script_js+"";
		                script_js       =script_js+"        var vehiculo                    =openerp.gpsmaps_var.posicion[id_vehicle];";
		                //script_js       =script_js+"        var google                      =openerp.gpsmaps_var.vgoogle;";
		                script_js       =script_js+"        var position 		            = new google.maps.LatLng(vehiculo[\"latitude\"],vehiculo[\"longitude\"]);	";
		                
		                
		                script_js       =script_js+"        var map                         =openerp.gpsmaps_var.map;";
		                script_js       =script_js+"        map.panTo(position);";
		                script_js       =script_js+"";
		                script_js       =script_js+"    }";
		                script_js       =script_js+"    else";
		                script_js       =script_js+"    {";
		                //script_js       =script_js+"        openerp.gpsmaps_var.vehiculo=undefined;";
		                script_js       =script_js+"        $(\"#odometro\").hide();";
		                script_js       =script_js+"    }";
		                
		                script_js       =script_js+"}";
		                
		                //script_js       =script_js+"alert(openerp.gpsmaps_var.vehiculo);";
		                		                
		                script_js       =script_js+"});";
		                script_js       =script_js+"</script>";
		                
		                opcion_vehiculo="<div class=\"oe_secondary_menu_section\" id=\"vehiculos\"> Vehiculos </div><ul class=\"oe_secondary_submenu nav nav-pills nav-stacked\" id=\"menu_vehicles\" style=\"display:block;\">"+opcion_vehiculo+"</ul>"+script_js;
		                
		                $("li > a > span:contains('Street View'):last").parent().parent().append(opcion_vehiculo);  
		            }
		        }
		        else ObjetoOdoo.menu_vehicle();		        
           
            },100);
		},
		vehicles: function()  
		{
		    openerp.gpsmaps_var.vehiculos=Array();
            var vehiculo	= new instance.web.Model('fleet.vehicle')
                .query(['model_id', 'license_plate', 'id', 'image_gps','driver_id'])
                .filter([['position_id','!=', false]])
                .all()
                .then(function (results) {
                    _(results).each(function (item) {                        
                        var id  =item["id"];
                        openerp.gpsmaps_var.vehiculos[id]=item;
                    });
                });
		},	

        codeLatLng: function (coordinates) 
        {
            geocoder=openerp.gpsmaps_var.geocoder;
            
            var latlngStr = coordinates.split(',', 2);
            var latlng = new google.maps.LatLng(latlngStr[0], latlngStr[1]);
            geocoder.geocode({'location': latlng}, function(results, status) 
            {
                if (status == google.maps.GeocoderStatus.OK) 
                {
                    if (results[1]) 
                    {
                        map=openerp.gpsmaps_var.map;
                        openerp.gpsmaps_var.vreturn=results[0].formatted_address;
                    } 
                    else 
                    {
                        openerp.gpsmaps_var.vreturn='Geocoder: No results found';
                    }
                } 
                else 
                {
                    openerp.gpsmaps_var.vreturn='Geocoder: Failed due to: ' + status;
                }
            });
            return openerp.gpsmaps_var.vreturn;
        },
			
        codeAddress: function (address) 
        {
            geocoder=openerp.gpsmaps_var.geocoder;
            geocoder.geocode({'address': address}, 
            function(results, status) 
            {
                if (status == google.maps.GeocoderStatus.OK) 
                {
                    map=openerp.gpsmaps_var.map;
                    map.setCenter(results[0].geometry.location);

                    
                    /*
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    */
                } 
                else 
                {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        },		
		del_locations: function(posiciones)  
		{
            if(openerp.gpsmaps_var.locations.length>1)                
            {
                for(idvehicle in posiciones)
                {
                    var positions_vehicle=openerp.gpsmaps_var.locations[idvehicle];                    
                    for(iposiciones in positions_vehicle)
                    {
                        openerp.gpsmaps_var.locations[idvehicle][iposiciones].setMap(null);
                    }                    
                }
            } 
		},		
		del_locations_otras: function()
		{		    
            if(openerp.gpsmaps_var.otras_locations.length>1)                
            {
                openerp.gpsmaps_var.otras_locations                
                for(idvehicle in openerp.gpsmaps_var.otras_locations)
                {
                    openerp.gpsmaps_var.otras_locations[idvehicle].setMap(null);
                }                
            }    
            
		},		
		del_array: function()  
		{
            openerp.gpsmaps_var.geofence        =Array();
            openerp.gpsmaps_var.geofences       =Array();
            openerp.gpsmaps_var.otras_locations =Array();                                           
		},		

        odometro: function(item,  map) 
        {
            if(item["batery"]==undefined)       item["batery"]  =0;
            if(item["speed"]==undefined)        item["speed"]   =0;
            if(item["milage"]==undefined)       item["milage"]  =0;
            
            var bat=item["batery"]*12/1-110;
            $("path.bateria").attr({"transform":"rotate("+ bat +" 250 250)"});            
            
            var vel=item["speed"]*12/10-110;
            $("path.velocidad").attr({"transform":"rotate("+ vel +" 250 250)"});
            
            $("#millas").html(item["milage"]);
            
            var tablero="";
            if(!(item["times"]==undefined || item["times"]==false || item["times"]=="false"))
                tablero= tablero + item["times"];
            if(!(item["event_id"]==undefined || item["event_id"]==false || item["event_id"]=="false"))        
                tablero= tablero + " :: " + item["event_id"];
            if(!(item["geofence_id"]==undefined || item["geofence_id"]==false || item["geofence_id"]=="false"))        
                tablero= tablero + " :: " + item["geofence_id"];

            
            if(!(item["latitude"]==undefined || item["latitude"]==false || item["latitude"]=="false"))
            {
                if((item["address"]==undefined || item["address"]==false || item["address"]=="false"))    
                {                
                    var scoordinates=item["latitude"]+','+item["longitude"];
                    var address     =this.codeLatLng(scoordinates);
                    
                    item["address"] ="("+scoordinates +") " +address;
                    
                    openerp.jsonRpc('/snippet_positions/render', 'call', {
                        'data': item
                    }).then(function(category) {
                        // just print the categories
                        //$(category).appendTo(self.$target);
                    })
                    .fail(function(e) {            
                        return;
                    });                
                }    
            }
            
            if(!(item["address"]==undefined || item["address"]=="undefined" || item["address"]==false || item["address"]=="false"))
            {
                var vaddress             =String(item["address"]);
                var address              =vaddress.split(":");						    
		        if(address[0]!="Geocoder")   tablero     =tablero + "<br>" + item["address"];
            }                        

            $("#tablero").html(tablero);
                        
            var posicion=this.LatLng({latitude:item["latitude"],longitude:item["longitude"]})            
            map.panTo(posicion);
        },
		locationsMap: function(map, coordinates, text, vehicle, type)  
		{
		    if(type==undefined)     type="icon";
		    else                    type="marker";

            var icon        =undefined;
            
            var posicion 		    = this.LatLng(coordinates);						    	
            if(type=="icon")
            {
		        icon        =135;
		        var marcador;
		        if(vehicle["course"]==undefined)        vehicle["course"]=1;
		        if(vehicle["device_id"]==undefined)     vehicle["device_id"]=1;
		        
		        if(vehicle["course"])                   icon    =vehicle["course"];
		        
			    if(icon>22 && icon<67)	icon=45;
			    else if(icon<112)		icon=90;
			    else if(icon<157)		icon=135;
			    else if(icon<202)		icon=180;
			    else if(icon<247)		icon=225;
			    else if(icon<292)		icon=270;
			    else if(icon<337)		icon=315;
			    else					icon=0;		

			    var image="01";
			    if(!(vehicle["image_gps"]==undefined || vehicle["image_gps"]==false))
			    {
			        image=vehicle["image_gps"];
			    }			
			    icon="/gpsmaps/static/src/img/vehiculo_" +image+ "/i"+icon+ ".png";
			    
                var vmodelo             =String(vehicle["device_id"]);		                
                var modelo              =vmodelo.split(",");						    
		        if(openerp.gpsmaps_var.vehiculo==modelo[0]) 
		        {
		            this.centerMap(map,posicion);			
		            this.odometro(vehicle,  map);
		        } 			    
            }
			var marcador 		    = this.markerMap( map, posicion, icon);									
			//var infowindow 		= this.messageMap(map, marcador, text);
			return marcador;
		},
		markerMap: function( map, position, icon) 
		{
			var markerOptions 		= new Object();
			markerOptions.position	=position;
			markerOptions.map		=map;
			if(icon!=undefined)
				markerOptions.icon		=icon;

	  		marker = new google.maps.Marker(markerOptions);
			return marker; 
		},	
		execute_streetMap: function(map, coordinates, vehicle)
		{
            var posicion		=this.LatLng(coordinates);
            
            this.centerMap(map,posicion);
            var curso           =vehicle["course"];		        
            var panoramaOptions = {
                position: posicion,
                pov: {
                  heading:  curso,
                  pitch:    10
                }
            };
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('street'), panoramaOptions);
            map.setStreetView(panorama);	                
		},
		streetMap: function( map, coordinates, vehicle)
		{
            var vmodelo             =String(vehicle["device_id"]);		                
            var modelo              =vmodelo.split(",");			
			if(openerp.gpsmaps_var.vehiculo==modelo[0]) 
			{			
                var peticion    =undefined
                if(openerp.gpsmaps_var.posicion_street==undefined)
                {
                    openerp.gpsmaps_var.posicion_street=coordinates;
                    this.execute_streetMap(map, coordinates, vehicle);
                }
                else
                {
                    var pos=openerp.gpsmaps_var.posicion_street;
                    if(pos.latitude!=coordinates.latitude && pos.longitude!=coordinates.longitude)
                    {
                        this.execute_streetMap(map, coordinates, vehicle);
                        openerp.gpsmaps_var.posicion_street=coordinates;
                    }                   
                }
            }
		},
	    centerMap: function(map, marcador)
    	{
    		map.panTo(marcador);
    	},			        
	    clearTimer: function()
    	{
            for(ipos in openerp.gpsmaps_var.refposiciones)
            {   
                clearInterval(openerp.gpsmaps_var.refposiciones[ipos]);
                openerp.gpsmaps_var.refposiciones[ipos]=null;
            }    
    	},
        poliline: function(map,LocationsLine)
        {        
			flightPath = new google.maps.Polyline({
				path: LocationsLine,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});		
			flightPath.setMap(map);
        },
        geofence: function(map)
        {        
            var objeto=this;
            var obj_geofence	= new instance.web.Model('gpsmaps.geofence')
                .query(['points', 'geofence'])
                .all()
                .then(function (results) {
                    _(results).each(function (item) 
                    { 
                        var spoints         =String(item["points"]);
                        var vpoints         =spoints.split(";");                        

                        for(ipoints in vpoints)
                        {                                
                            var spoint      =String(vpoints[ipoints]);
                            var vpoint      =spoint.split(",");
                            var coordinates	        ={latitude:vpoint[0],longitude:vpoint[1]};  
                            objeto.ageofence(map,coordinates);                    
                        }
                        objeto.poliline(map,openerp.gpsmaps_var.geofences);
		                objeto.del_array();
                    });
                });
        },                				        
        ageofence: function(map,coordinates) 
        {                 
	        var position    =this.LatLng(coordinates);

            if(openerp.gpsmaps_var.geofence.length>0)   
            {
                openerp.gpsmaps_var.geofence.push(coordinates);
                openerp.gpsmaps_var.geofences.push(position);
            }    
            else                                        
            {
                openerp.gpsmaps_var.geofence=Array(coordinates);
                openerp.gpsmaps_var.geofences=Array(position);
            }    
        },        
        positions: function(map) 
        {
        	if($('#map').length)
        	{        
                if(openerp.gpsmaps_var.vehiculos.length>1)
                {       
                    var ObjetoOdoo      =this;
			        var locations       =Array();
			        var location;                
                    var obj_vehicle	= new instance.web
                        .Model('fleet.vehicle')
                        .query(['id', 'position_id'])
                        .filter([['position_id','!=', false]])
                        .all()
                        .then(function (results)
                        {      
                            _(results).each(function (vehicle)
                            {        
                                if(!(vehicle["position_id"]=="false" || vehicle["position_id"]==false|| vehicle["position_id"]==undefined))
                                {
                                    var vposition                               =String(vehicle["position_id"]);

                                    var aposition                               =vposition.split(",");
                                    var position_id                             =aposition[0];
                                                        
                                    var obj_positions	= new instance.web
                                    .Model('gpsmaps.positions')
                                    .query(['address', 'latitude', 'longitude', 'course', 'speed', 'batery', 'milage','times','device_id','event_id','geofence_id'])
                                    .filter([['id','=', position_id]])
                                    .all()                                
                                    .then(function (positions)
                                    {
                                        _(positions).each(function (position) 
                                        {
                                            var vehicle_id                            =vehicle['id'];
                                            openerp.gpsmaps_var.posicion[vehicle_id]  =position;                                                    
                                        });                                  
                                    }); 
                                }
                            });
                        }
                    );

                }
            }
            else    this.clearTimer();
        },
        positions_history: function(map,search) 
        {
        	if($('#map').length)
        	{        
                openerp.gpsmaps_var.posiciones=Array();
                var ObjetoOdoo=this;
		        var locations=Array();			        
		        var location;                
                var obj_positions	= new instance.web
                    .Model('gpsmaps.positions')
                    .query(['address', 'latitude', 'longitude', 'course', 'speed', 'batery', 'milage','times','device_id','event_id','geofence_id'])   
                    .filter(search)
                    .order_by('times')
                    .all()
                    .then(function (results) 
                    {      
                        _(results).each(function (item) 
                        {                                
                            if(openerp.gpsmaps_var.posiciones.length>0)  openerp.gpsmaps_var.posiciones.push(item);
                            else                                         openerp.gpsmaps_var.posiciones[1]=item;                                                                
                        });
                    });
            }
            else    this.clearTimer();
        }        
    });           
}
function metodo_history()
{    
    var map             =openerp.gpsmaps_var.map;
    var google      =openerp.gpsmaps_var.google;
    
    var ObjetoOdoo      = new openerp.gpsmaps.gpsmaps();
    var history         = new openerp.gpsmaps.history();
    var search_history=[
        ['device_id.id', '=', openerp.gpsmaps_var.vehiculo],
        ['times', '<', $("#fecha").val() + ' 23:59:59'],
        ['times', '>', $("#fecha").val() + ' 00:00:01']
    ];
    history.search_history(ObjetoOdoo,map,search_history,0);    
}   

function metodo_emular()
{
    var map             =openerp.gpsmaps_var.map        ;
    var google          =openerp.gpsmaps_var.google;
    
    var ObjetoOdoo      = new openerp.gpsmaps.gpsmaps();
    var history         = new openerp.gpsmaps.history();
    var search_history=[
        ['device_id.id', '=', openerp.gpsmaps_var.vehiculo],
        ['times', '<', $("#fecha").val() + ' 23:59:59'],
        ['times', '>', $("#fecha").val() + ' 00:00:01']
    ];    
    ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);
    history.paint_history(ObjetoOdoo,map,search_history, 1,900);
}   
function metodo_emular_street()
{
    var map             =openerp.gpsmaps_var.map;
    var google          =openerp.gpsmaps_var.google;
    
    var ObjetoOdoo      = new openerp.gpsmaps.gpsmaps();
    var history         = new openerp.gpsmaps.history_street();
    var search_history=[
        ['device_id.id', '=', openerp.gpsmaps_var.vehiculo],
        ['times', '<', $("#fecha").val() + ' 23:59:59'],
        ['times', '>', $("#fecha").val() + ' 00:00:01']
    ];    
    ObjetoOdoo.del_locations(openerp.gpsmaps_var.posiciones);
    history.paint_history(ObjetoOdoo,map,search_history, 1,4000);
} 
function metodo_position()
{
    if($("span.oe_breadcrumb_item:contains('gpsmaps.positions,')").length)
    {
        var sid             =String($("span.oe_breadcrumb_item:contains('gpsmaps.positions,')").html());
        var vid             =sid.split(",");
        var id              =vid[1];
        
        var coordinates	    ={latitude:19.057522756727606,longitude:-104.29785901920393};                                      
        var gpsmaps         = new openerp.gpsmaps.mapForm();
        gpsmaps.start(id);
    }    
}
function metodo_geofence(tipo)
{
    if(tipo=="inicio")
    {
        var sid             =String($("span.oe_breadcrumb_item:contains('gpsmaps.positions,')").html());
        var vid             =sid.split(",");
        var id              =vid[1];
        
        var coordinates	    ={latitude:19.057522756727606,longitude:-104.29785901920393};                                      
        var geofence        =new openerp.gpsmaps.geofence();
        geofence.start();

        $("#search").click(function()
        {
            address="Colima, Colima";            
            address=$("#address").val();
            geofence.codeAddress(address);
        });        
    }        
    else
    {
        var geofence         = new openerp.gpsmaps.geofence();
        geofence.start();
    }
}
