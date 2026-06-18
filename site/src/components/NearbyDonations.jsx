import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Star, Globe, Loader, AlertCircle } from "lucide-react";
import { auth } from "../firebase";

export default function NearbyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile + geolocation
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            });
          },
          () => setUserLocation(null)
        );
      }
    }
  }, []);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  useEffect(() => {
    async function loadDonations() {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/donations/nearby", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch donation points");

        const data = await res.json();
        setDonations(data.donations || []);
        setCity(data.city || "");

        if (!data.donations || data.donations.length === 0) {
          setError(data.message || "No donation points found.");
        } else {
          setError(null); // ← ΑΥΤΟ ΕΛΕΙΠΕ
        }

      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    loadDonations();
  }, []);

  // Build smart directions URL
  function buildDirectionsUrl(point) {
    const dest = encodeURIComponent(point.address);

    if (userLocation) {
      const origin = `${userLocation.lat},${userLocation.lon}`;

      if (isMobile) {
        return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
      }

      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
    }

    if (isMobile) {
      return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading donation points...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">No Donations Available</h3>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-800">Nearby Donation Points</h2>
        {city && (
          <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {city}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {donations.map((point, idx) => {
          const directionsUrl = buildDirectionsUrl(point);

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{point.name}</h3>
                  <p className="text-xs font-medium text-emerald-600 mt-1">{point.type}</p>
                </div>

                {point.rating && (
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-amber-700">{point.rating}</span>
                  </div>
                )}
              </div>

              {/* Mini Map Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  title={`Map of ${point.name}`}
                  width="100%"
                  height="180"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-cJafQTyLlSiAgPOBia1FCUvYnkdkMCY&q=${encodeURIComponent(
                    point.address
                  )}`}
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-slate-700 font-medium">{point.address}</p>
                    {point.distance && (
                      <p className="text-xs text-slate-500 mt-1">📍 {point.distance} away</p>
                    )}
                  </div>
                </div>

                {point.phone && (
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${point.phone}`} className="text-emerald-600 font-medium">
                      {point.phone}
                    </a>
                  </div>
                )}

                {point.hours && (
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{point.hours}</p>
                  </div>
                )}

                {point.website && (
                  <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <a
                      href={point.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col md:flex-row gap-2">
                {point.phone && (
                  <a
                    href={`tel:${point.phone}`}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl text-center"
                  >
                    Contact
                  </a>
                )}

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl text-center"
                >
                  Open in Google Maps
                </a>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl text-center"
                >
                  Start Navigation
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
