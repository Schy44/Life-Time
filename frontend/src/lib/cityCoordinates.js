// Helper to get approximate coordinates for major cities
// This avoids needing external geocoding APIs

export const cityCoordinates = {
    // North America
    "new york": [40.7128, -74.0060],
    "los angeles": [34.0522, -118.2437],
    "chicago": [41.8781, -87.6298],
    "toronto": [43.6532, -79.3832],
    "vancouver": [49.2827, -123.1207],
    "mexico city": [19.4326, -99.1332],

    // Europe
    "london": [51.5074, -0.1278],
    "paris": [48.8566, 2.3522],
    "berlin": [52.5200, 13.4050],
    "madrid": [40.4168, -3.7038],
    "rome": [41.9028, 12.4964],
    "amsterdam": [52.3676, 4.9041],
    "barcelona": [41.3851, 2.1734],
    "istanbul": [41.0082, 28.9784],
    "moscow": [55.7558, 37.6173],

    // Asia
    "tokyo": [35.6762, 139.6503],
    "beijing": [39.9042, 116.4074],
    "shanghai": [31.2304, 121.4737],
    "hong kong": [22.3193, 114.1694],
    "singapore": [1.3521, 103.8198],
    "dubai": [25.2048, 55.2708],
    "mumbai": [19.0760, 72.8777],
    "delhi": [28.7041, 77.1025],
    "bangkok": [13.7563, 100.5018],
    "seoul": [37.5665, 126.9780],
    "manila": [14.5995, 120.9842],
    "jakarta": [-6.2088, 106.8456],
    "karachi": [24.8607, 67.0011],
    "dhaka": [23.8103, 90.4125],

    // Middle East
    "riyadh": [24.7136, 46.6753],
    "cairo": [30.0444, 31.2357],
    "tehran": [35.6892, 51.3890],
    "baghdad": [33.3152, 44.3661],

    // Africa
    "lagos": [6.5244, 3.3792],
    "johannesburg": [-26.2041, 28.0473],
    "nairobi": [-1.2864, 36.8172],
    "cape town": [-33.9249, 18.4241],

    // South America
    "são paulo": [-23.5505, -46.6333],
    "rio de janeiro": [-22.9068, -43.1729],
    "buenos aires": [-34.6037, -58.3816],
    "bogotá": [4.7110, -74.0721],
    "lima": [-12.0464, -77.0428],

    // Oceania
    "sydney": [-33.8688, 151.2093],
    "melbourne": [-37.8136, 144.9631],
    "auckland": [-36.8485, 174.7633],
};

// Get coordinates for a city, with country fallback
export const getCityCoordinates = (city, country) => {
    if (!city) city = "";
    if (!country) country = "";

    const cityLower = city.toLowerCase().trim();

    // Direct city match
    if (cityCoordinates[cityLower]) {
        return cityCoordinates[cityLower];
    }

    // Country center fallbacks
    const countryLower = country.toLowerCase().trim();
    const countryFallbacks = {
        "united states": [37.0902, -95.7129],
        "usa": [37.0902, -95.7129],
        "us": [37.0902, -95.7129],
        "canada": [56.1304, -106.3468],
        "ca": [56.1304, -106.3468],
        "united kingdom": [55.3781, -3.4360],
        "uk": [55.3781, -3.4360],
        "gb": [55.3781, -3.4360],
        "germany": [51.1657, 10.4515],
        "de": [51.1657, 10.4515],
        "france": [46.2276, 2.2137],
        "fr": [46.2276, 2.2137],
        "spain": [40.4637, -3.7492],
        "es": [40.4637, -3.7492],
        "italy": [41.8719, 12.5674],
        "it": [41.8719, 12.5674],
        "japan": [36.2048, 138.2529],
        "jp": [36.2048, 138.2529],
        "china": [35.8617, 104.1954],
        "cn": [35.8617, 104.1954],
        "india": [20.5937, 78.9629],
        "in": [20.5937, 78.9629],
        "australia": [-25.2744, 133.7751],
        "au": [-25.2744, 133.7751],
        "brazil": [-14.2350, -51.9253],
        "br": [-14.2350, -51.9253],
        "mexico": [23.6345, -102.5528],
        "mx": [23.6345, -102.5528],
        "pakistan": [30.3753, 69.3451],
        "pk": [30.3753, 69.3451],
        "bangladesh": [23.6850, 90.3563],
        "bd": [23.6850, 90.3563],
    };

    if (countryFallbacks[countryLower]) {
        return countryFallbacks[countryLower];
    }

    // Default to world center if nothing found
    return [20, 0];
};
