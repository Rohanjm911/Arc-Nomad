import httpx
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Curated catalog of global travel destinations for instant offline fallback
GLOBAL_DESTINATIONS_FALLBACK: Dict[str, Tuple[float, float, str, str]] = {
    # Key: (latitude, longitude, name, country)
    "tokyo": (35.6762, 139.6503, "Tokyo", "Japan"),
    "kyoto": (35.0116, 135.7681, "Kyoto", "Japan"),
    "osaka": (34.6937, 135.5023, "Osaka", "Japan"),
    "japan": (35.6762, 139.6503, "Tokyo", "Japan"),
    "paris": (48.8566, 2.3522, "Paris", "France"),
    "france": (48.8566, 2.3522, "Paris", "France"),
    "rome": (41.9028, 12.4964, "Rome", "Italy"),
    "amalfi": (40.6340, 14.6027, "Amalfi", "Italy"),
    "florence": (43.7696, 11.2558, "Florence", "Italy"),
    "venice": (45.4408, 12.3155, "Venice", "Italy"),
    "italy": (41.9028, 12.4964, "Rome", "Italy"),
    "barcelona": (41.3879, 2.1699, "Barcelona", "Spain"),
    "madrid": (40.4168, -3.7038, "Madrid", "Spain"),
    "spain": (40.4168, -3.7038, "Madrid", "Spain"),
    "london": (51.5074, -0.1278, "London", "United Kingdom"),
    "edinburgh": (55.9533, -3.1883, "Edinburgh", "United Kingdom"),
    "new york": (40.7128, -74.0060, "New York", "United States"),
    "san francisco": (37.7749, -122.4194, "San Francisco", "United States"),
    "los angeles": (34.0522, -118.2437, "Los Angeles", "United States"),
    "honolulu": (21.3069, -157.8583, "Honolulu", "United States"),
    "hawaii": (21.3069, -157.8583, "Honolulu", "United States"),
    "bali": (-8.4095, 115.1889, "Bali", "Indonesia"),
    "indonesia": (-8.4095, 115.1889, "Bali", "Indonesia"),
    "sydney": (-33.8688, 151.2093, "Sydney", "Australia"),
    "melbourne": (-37.8136, 144.9631, "Melbourne", "Australia"),
    "reykjavik": (64.1466, -21.9426, "Reykjavik", "Iceland"),
    "iceland": (64.1466, -21.9426, "Reykjavik", "Iceland"),
    "cairo": (30.0444, 31.2357, "Cairo", "Egypt"),
    "bangkok": (13.7563, 100.5018, "Bangkok", "Thailand"),
    "phuket": (7.8804, 98.3923, "Phuket", "Thailand"),
    "dubai": (25.2048, 55.2708, "Dubai", "United Arab Emirates"),
    "singapore": (1.3521, 103.8198, "Singapore", "Singapore"),
    "swiss alps": (46.5592, 7.9868, "Swiss Alps", "Switzerland"),
    "zermatt": (45.9765, 7.7491, "Zermatt", "Switzerland"),
    "zurich": (47.3769, 8.5417, "Zurich", "Switzerland"),
    "switzerland": (46.8182, 8.2275, "Bern", "Switzerland"),
    "berlin": (52.5200, 13.4050, "Berlin", "Germany"),
    "munich": (48.1351, 11.5820, "Munich", "Germany"),
    "amsterdam": (52.3676, 4.9041, "Amsterdam", "Netherlands"),
    "vienna": (48.2082, 16.3738, "Vienna", "Austria"),
    "prague": (50.0755, 14.4378, "Prague", "Czech Republic"),
    "budapest": (47.4979, 19.0402, "Budapest", "Hungary"),
    "athens": (37.9838, 23.7275, "Athens", "Greece"),
    "santorini": (36.3932, 25.4615, "Santorini", "Greece"),
    "lisbon": (38.7223, -9.1393, "Lisbon", "Portugal"),
    "dublin": (53.3498, -6.2603, "Dublin", "Ireland"),
    "seoul": (37.5665, 126.9780, "Seoul", "South Korea"),
    "hanoi": (21.0285, 105.8542, "Hanoi", "Vietnam"),
    "mumbai": (19.0760, 72.8777, "Mumbai", "India"),
    "delhi": (28.6139, 77.2090, "Delhi", "India"),
    "goa": (15.2993, 74.1240, "Goa", "India"),
    "cape town": (-33.9249, 18.4241, "Cape Town", "South Africa"),
    "toronto": (43.6532, -79.3832, "Toronto", "Canada"),
    "vancouver": (49.2827, -123.1207, "Vancouver", "Canada"),
    "rio de janeiro": (-22.9068, -43.1729, "Rio de Janeiro", "Brazil"),
    "buenos aires": (-34.6037, -58.3816, "Buenos Aires", "Argentina"),
    "istanbul": (41.0082, 28.9784, "Istanbul", "Turkey"),
    "marrakech": (31.6295, -7.9811, "Marrakech", "Morocco"),
    "auckland": (-36.8485, 174.7633, "Auckland", "New Zealand"),
    "queenstown": (-45.0312, 168.6626, "Queenstown", "New Zealand"),
}


class GeocodingService:
    def __init__(self):
        self._cache: Dict[str, List[Dict[str, Any]]] = {}

    def _match_offline(self, query: str) -> Optional[Dict[str, Any]]:
        q_lower = query.lower().strip()
        for key, (lat, lng, name, country) in GLOBAL_DESTINATIONS_FALLBACK.items():
            if key in q_lower or q_lower in key:
                return {
                    "name": name,
                    "latitude": lat,
                    "longitude": lng,
                    "country": country,
                    "display_name": f"{name}, {country}",
                }
        return None

    async def geocode(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Geocode a location query using Open-Meteo free geocoding API with offline fallback.
        """
        if not query or not query.strip():
            return []

        clean_query = query.strip()
        cache_key = f"{clean_query.lower()}_{limit}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Extract primary place token for API search (e.g. "Rome & Amalfi Coast" -> "Rome")
        search_term = clean_query.split('&')[0].split('and')[0].split(',')[0].strip()

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                url = f"https://geocoding-api.open-meteo.com/v1/search?name={httpx.URL(search_term)}&count={limit}&language=en&format=json"
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    if results:
                        formatted = []
                        for r in results:
                            name = r.get("name", "")
                            admin1 = r.get("admin1", "")
                            country = r.get("country", "")
                            parts = [p for p in [name, admin1, country] if p]
                            formatted.append({
                                "name": name,
                                "latitude": float(r.get("latitude")),
                                "longitude": float(r.get("longitude")),
                                "country": country,
                                "admin1": admin1,
                                "display_name": ", ".join(parts),
                            })
                        self._cache[cache_key] = formatted
                        return formatted
        except Exception as e:
            logger.warning(f"Geocoding API lookup failed for '{clean_query}': {e}. Using offline directory.")

        # Fallback to offline catalog
        offline_match = self._match_offline(clean_query)
        if offline_match:
            results = [offline_match]
            self._cache[cache_key] = results
            return results

        # Ultimate generic center (Rome/Mediterranean)
        generic = [{
            "name": clean_query.title(),
            "latitude": 41.9028,
            "longitude": 12.4964,
            "country": "World",
            "display_name": f"{clean_query.title()}",
        }]
        return generic

    def get_destination_coords_sync(self, query: str) -> Tuple[float, float]:
        """
        Synchronous helper for resolving destination coordinates (checks cache, offline catalog, or rapid http).
        """
        if not query or not query.strip():
            return (41.9028, 12.4964)

        q_clean = query.strip()
        cache_key = f"{q_clean.lower()}_1"
        if cache_key in self._cache and self._cache[cache_key]:
            c = self._cache[cache_key][0]
            return (c["latitude"], c["longitude"])

        offline = self._match_offline(q_clean)
        if offline:
            return (offline["latitude"], offline["longitude"])

        search_term = q_clean.split('&')[0].split('and')[0].split(',')[0].strip()
        try:
            with httpx.Client(timeout=3.0) as client:
                url = f"https://geocoding-api.open-meteo.com/v1/search?name={search_term}&count=1&language=en&format=json"
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json().get("results", [])
                    if data:
                        lat = float(data[0]["latitude"])
                        lng = float(data[0]["longitude"])
                        self._cache[cache_key] = [{
                            "name": data[0].get("name", q_clean),
                            "latitude": lat,
                            "longitude": lng,
                            "country": data[0].get("country", ""),
                            "display_name": f"{data[0].get('name')}, {data[0].get('country', '')}"
                        }]
                        return (lat, lng)
        except Exception as e:
            logger.debug(f"Sync geocode failed for '{q_clean}': {e}")

        return (41.9028, 12.4964)


geocoding_service = GeocodingService()
