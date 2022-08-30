if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;

        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

var resolveCallbacks = [];
var rejectCallbacks = [];

window.OSMap = {
    loadOSMapsScripts: function (wrapper, ref, id, zoom, center, defaultView, apiKey, resolve, reject) {
        resolveCallbacks.push(resolve);
        rejectCallbacks.push(reject);

        if (defaultView['rz_map_init']) {
            OSMap.loadOSMaps(wrapper, ref, id, zoom, center, defaultView, apiKey, resolve, reject);
            return;
        }

        defaultView['rz_map_init'] = function () {
            for (var i = 0; i < resolveCallbacks.length; i++) {
                resolveCallbacks[i](defaultView.OS);
            }
        };

        var document = defaultView.document;
        var scriptPlaces = document.createElement('script');
        scriptPlaces.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js';
        scriptPlaces.async = true;
        scriptPlaces.defer = true;
        scriptPlaces.onerror = function (err) {
            for (var i = 0; i < rejectCallbacks.length; i++) {
                rejectCallbacks[i](err);
            }
        };
        document.body.appendChild(scriptPlaces);

        var document = defaultView.document;
        var linkOSCSS = document.createElement('link');
        linkOSCSS.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css';
        linkOSCSS.async = true;
        linkOSCSS.defer = true;
        linkOSCSS.rel = 'stylesheet';
        document.body.appendChild(linkOSCSS);

        var document = defaultView.document;
        var scriptPlaces = document.createElement('script');
        scriptPlaces.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-language/v0.10.1/mapbox-gl-language.js';
        scriptPlaces.async = true;
        scriptPlaces.defer = true;
        scriptPlaces.onerror = function (err) {
            for (var i = 0; i < rejectCallbacks.length; i++) {
                rejectCallbacks[i](err);
            }
        };
        document.body.appendChild(scriptPlaces);

        var document = defaultView.document;
        var linkOSCSS = document.createElement('link');
        linkOSCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css';
        linkOSCSS.async = true;
        linkOSCSS.defer = true;
        linkOSCSS.rel = 'stylesheet';
        linkOSCSS.onload = function () {
            console.log("CSS loaded and ready");
            var document = defaultView.document;
            var scriptOS = document.createElement('script');
            scriptOS.src = 'https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.js';
            scriptOS.async = true;
            scriptOS.defer = true;
            scriptOS.onload = function () {
                console.log("Script loaded and ready");
                OSMap.loadOSMaps(wrapper, ref, id, zoom, center, defaultView, apiKey, resolve, reject);
            };
            scriptOS.onerror = function (err) {
                for (var i = 0; i < rejectCallbacks.length; i++) {
                    rejectCallbacks[i](err);
                }
            };
            document.body.appendChild(scriptOS);
        };
        document.body.appendChild(linkOSCSS);
    },
    loadOSMaps: function (wrapper, ref, id, zoom, center, defaultView, apiKey, resolve, reject) {
        var ff = document.querySelectorAll('.rz-dialog-content');
        if (ff.length > 0) {
            for (var i = 0; i < ff.length; i++) {
                ff[i].style.overflow = 'hidden';
                ff[i].style.height = '100%';
            }
        }
        var ff = document.querySelectorAll('.rz-dialog-content > .content');
        if (ff.length > 0) {
            for (var i = 0; i < ff.length; i++) {
                ff[i].style.overflow = 'hidden';
                ff[i].style.height = '100%';
            }
        }
        mapboxgl.accessToken = apiKey;
        OSMap[id] = ref;

        OSMap[id].instance = new mapboxgl.Map({
            container: wrapper,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: center,
            zoom: zoom
        });

        var mapboxLanguage = new MapboxLanguage({
            defaultLanguage: 'ru'
        });

        OSMap[id].instance.addControl(mapboxLanguage);

        OSMap[id].instance.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                accessToken: mapboxgl.accessToken,
                language: 'ru-RU'
            })
        );

        var nav = new mapboxgl.NavigationControl();
        OSMap[id].instance.addControl(nav, 'bottom-right');
        OSMap[id].instance.addControl(new mapboxgl.FullscreenControl());
        OSMap[id].instance.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

        OSMap[id].instance.on('load', function (e) {
            OSMap[id].instance.setLayoutProperty('country-label', 'text-field', [
                'get',
                'name_ru'
            ]);

            OSMap[id].marker = new mapboxgl.Marker({
                draggable: true,
                color: '#009c82'
            })
                .setLngLat(center)
                .addTo(OSMap[id].instance);

            OSMap[id].instance.on('click', function (e) {
                OSMap[id].invokeMethodAsync('OSMap.OnMapClick', { Position: { Lat: e.lngLat.lat, Lng: e.lngLat.lng } });
                OSMap[id].marker.setLngLat(e.lngLat);
                OSMap[id].instance.flyTo({ center: e.lngLat, speed: 0.35 });
            });
            OSMap[id].marker.on('dragend', function (e) {
                var lngLat = OSMap[id].marker.getLngLat();
                OSMap[id].invokeMethodAsync('OSMap.OnMapClick', { Position: { Lat: lngLat.lat, Lng: lngLat.lng } });
                OSMap[id].instance.flyTo({ center: lngLat, speed: 0.35 });
            });
        });

    },
    createMap: function (wrapper, ref, id, apiKey, zoom, center, markers) {

        var api = function () {
            var defaultView = document.defaultView;

            return new Promise(function (resolve, reject) {
                if (defaultView.OS && defaultView.OS.maps) {
                    return resolve(defaultView.OS);
                }
                OSMap.loadOSMapsScripts(wrapper, ref, id, zoom, center, defaultView, apiKey, resolve, reject);
            });
        }
        api().then(function (OS) { });
    },
    updateMap: function (id, zoom, center, markers) {
        if (OSMap[id] && OSMap[id].instance) { }
    },
    destroyMap: function (id) {
        if (OSMap[id].instance) {
            delete OSMap[id].instance;
            delete OSMap[id].marker;
        }
    }
};