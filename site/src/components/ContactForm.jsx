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
    <div className="min-h-screen sf-bg py-12 px-4 mt-12" style={{ background: 'linear-gradient(to bottom right, rgba(5, 150, 105, 0.05), var(--sf-bg))' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-lg mb-4" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
            <Mail className="w-8 h-8" style={{ color: 'var(--sf-primary)' }} />
          </div>
          <h1 className="text-4xl font-bold sf-text mb-4">Get in Touch</h1>
          <p className="text-xl sf-text-muted">
            Have questions about SmartFoodSave? We'd love to hear from you!
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(5, 150, 105, 0.1)', borderLeft: '4px solid var(--sf-primary)', color: 'var(--sf-primary)' }}>
            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--sf-primary)' }} />
            <div>
              <h3 className="font-semibold">Message sent successfully!</h3>
              <p style={{ opacity: 0.9 }}>We'll get back to you within 24-48 hours.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#991b1b' }}>
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <div>
              <h3 className="font-semibold">Error sending message</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="sf-bg rounded-xl shadow-lg p-8 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold sf-text mb-2">
              <User className="inline w-4 h-4 mr-2" style={{ color: 'var(--sf-primary)' }} />
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
              className="w-full px-4 py-3 rounded-lg outline-none transition sf-text"
              style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px var(--sf-primary)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold sf-text mb-2">
              <Mail className="inline w-4 h-4 mr-2" style={{ color: 'var(--sf-primary)' }} />
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
              className="w-full px-4 py-3 rounded-lg outline-none transition sf-text"
              style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px var(--sf-primary)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* Phone with country code */}
          <div>
            <label className="block text-sm font-semibold sf-text mb-2">
              <Phone className="inline w-4 h-4 mr-2" style={{ color: 'var(--sf-primary)' }} />
              Phone Number (Optional)
            </label>
            <div className="flex gap-2">
              {/* Country code dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setDropdownOpen(prev => !prev); setSearch(''); }}
                  className="flex items-center gap-1.5 px-3 py-3 rounded-lg transition text-sm font-medium whitespace-nowrap outline-none sf-text"
                  style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
                >
                  <span className="text-lg leading-none">{countryCode.flag}</span>
                  <span>{countryCode.code}</span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--sf-text-muted)' }} />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-52 sf-bg rounded-lg shadow-xl overflow-hidden" style={{ border: '1px solid var(--sf-border)' }}>
                    <div className="p-2" style={{ borderBottom: '1px solid var(--sf-border)' }}>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-md outline-none sf-text"
                        style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
                        autoFocus
                      />
                    </div>
                    <ul className="max-h-52 overflow-y-auto">
                      {filteredCountries.map((c, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => { setCountryCode(c); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition text-left sf-text"
                            style={{
                              background: countryCode.name === c.name && countryCode.code === c.code ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                              color: countryCode.name === c.name && countryCode.code === c.code ? 'var(--sf-primary)' : 'var(--sf-text)'
                            }}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-medium">{c.name}</span>
                            <span className="ml-auto" style={{ color: 'var(--sf-text-muted)' }}>{c.code}</span>
                          </button>
                        </li>
                      ))}
                      {filteredCountries.length === 0 && (
                        <li className="px-3 py-3 text-sm text-center sf-text-muted">No results</li>
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
                className="flex-1 px-4 py-3 rounded-lg outline-none transition sf-text"
                style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px var(--sf-primary)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold sf-text mb-2">
              <MessageSquare className="inline w-4 h-4 mr-2" style={{ color: 'var(--sf-primary)' }} />
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
              className="w-full px-4 py-3 rounded-lg outline-none transition resize-none sf-text"
              style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-card)', color: 'var(--sf-text)' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px var(--sf-primary)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            style={{ background: 'var(--sf-primary)', opacity: loading ? 0.6 : 1 }}
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
            <h3 className="font-semibold text-gray-900 mb-2 dark:">Email</h3>
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