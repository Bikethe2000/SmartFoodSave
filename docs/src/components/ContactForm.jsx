import { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+1', flag: '🇨🇦', name: 'CA' },
  { code: '+44', flag: '🇬🇧', name: 'GB' },
  { code: '+30', flag: '🇬🇷', name: 'GR' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+39', flag: '🇮🇹', name: 'IT' },
  { code: '+34', flag: '🇪🇸', name: 'ES' },
  { code: '+31', flag: '🇳🇱', name: 'NL' },
  { code: '+32', flag: '🇧🇪', name: 'BE' },
  { code: '+41', flag: '🇨🇭', name: 'CH' },
  { code: '+43', flag: '🇦🇹', name: 'AT' },
  { code: '+351', flag: '🇵🇹', name: 'PT' },
  { code: '+48', flag: '🇵🇱', name: 'PL' },
  { code: '+46', flag: '🇸🇪', name: 'SE' },
  { code: '+47', flag: '🇳🇴', name: 'NO' },
  { code: '+45', flag: '🇩🇰', name: 'DK' },
  { code: '+358', flag: '🇫🇮', name: 'FI' },
  { code: '+353', flag: '🇮🇪', name: 'IE' },
  { code: '+420', flag: '🇨🇿', name: 'CZ' },
  { code: '+36', flag: '🇭🇺', name: 'HU' },
  { code: '+40', flag: '🇷🇴', name: 'RO' },
  { code: '+359', flag: '🇧🇬', name: 'BG' },
  { code: '+385', flag: '🇭🇷', name: 'HR' },
  { code: '+7', flag: '🇷🇺', name: 'RU' },
  { code: '+380', flag: '🇺🇦', name: 'UA' },
  { code: '+90', flag: '🇹🇷', name: 'TR' },
  { code: '+972', flag: '🇮🇱', name: 'IL' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+82', flag: '🇰🇷', name: 'KR' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+64', flag: '🇳🇿', name: 'NZ' },
  { code: '+55', flag: '🇧🇷', name: 'BR' },
  { code: '+52', flag: '🇲🇽', name: 'MX' },
  { code: '+54', flag: '🇦🇷', name: 'AR' },
  { code: '+27', flag: '🇿🇦', name: 'ZA' },
  { code: '+20', flag: '🇪🇬', name: 'EG' },
  { code: '+234', flag: '🇳🇬', name: 'NG' },
  { code: '+254', flag: '🇰🇪', name: 'KE' },
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [countryCode, setCountryCode] = useState(COUNTRIES.find(c => c.name === 'GR'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const fullPhone = formData.phone
      ? `${countryCode.code}${formData.phone}`
      : '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://foodwasteai-production.up.railway.app'}/api/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, phone: fullPhone })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 mt-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-lg mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600">
            Have questions about SmartFoodSave? We'd love to hear from you!
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Message sent successfully!</h3>
              <p className="text-green-800">We'll get back to you within 24-48 hours.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error sending message</h3>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-2 text-green-600" />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-2 text-green-600" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Phone with country code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-2 text-green-600" />
              Phone Number (Optional)
            </label>
            <div className="flex gap-2">
              {/* Country code dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setDropdownOpen(prev => !prev); setSearch(''); }}
                  className="flex items-center gap-1.5 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-sm font-medium text-gray-700 whitespace-nowrap focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <span className="text-lg leading-none">{countryCode.flag}</span>
                  <span>{countryCode.code}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-green-400"
                        autoFocus
                      />
                    </div>
                    <ul className="max-h-52 overflow-y-auto">
                      {filteredCountries.map((c, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => { setCountryCode(c); setDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-green-50 transition text-left ${countryCode.name === c.name && countryCode.code === c.code ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'}`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-medium">{c.name}</span>
                            <span className="ml-auto text-gray-400">{c.code}</span>
                          </button>
                        </li>
                      ))}
                      {filteredCountries.length === 0 && (
                        <li className="px-3 py-3 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Phone number input */}
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="69XXXXXXXX"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="inline w-4 h-4 mr-2 text-green-600" />
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell us what's on your mind..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center">
            We respect your privacy. Your message will only be used to respond to your inquiry.
          </p>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">smartfoodsave@gmail.com</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">+30 6941625842</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
            <p className="text-gray-600">24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
} 