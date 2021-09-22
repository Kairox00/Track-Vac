mapboxgl.accessToken = 'pk.eyJ1Ijoia2Fpcm94MDAiLCJhIjoiY2t0bjFrdGFvMmJoczJ2cW5jMGkwOGZmYyJ9.ki7GbD0dVW1_IONalKVlbQ';
        const coordinates = center.address.coordinates;
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: coordinates, // starting position [lng, lat]
            zoom: 13 // starting zoom
        });
        new mapboxgl.Marker().setLngLat(coordinates).addTo(map);