import { Award, Users, HeartHandshake } from 'lucide-react';

export default function About() {
  const team = [
    {
      name: 'Elena Vance',
      role: 'Master Hair Specialist',
      experience: 'Color & Precision Cuts',
      bio: 'Specializing in dimensional balayage, custom corrective coloring, and textured precision cutting.'
    },
    {
      name: 'Aria Montgomery',
      role: 'Licensed Aesthetician',
      experience: 'Clinical Skincare & Facials',
      bio: 'Focused on targeted facial treatments, ultrasonic pore extraction, and barrier repair therapies.'
    },
    {
      name: 'Zara Chen',
      role: 'Senior Bridal Stylist',
      experience: 'Bridal & Formal Styling',
      bio: 'Experienced bridal and event artist specializing in long-lasting bridal beauty and couture updos.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          About Enrich Beauty Parlour & Cosmetic Clinic
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Premier Salon & Cosmetic Clinic in Sikar, Rajasthan
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Located at First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001, Enrich Beauty Parlour & Cosmetic Clinic provides attentive, tailored beauty treatments and cosmetic skincare designed around each client's individual needs.
        </p>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-stone-100 flex items-center justify-center text-rose-700">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Licensed Stylists</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            All services are provided by certified specialists holding current state cosmetology and aesthetics licenses.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-stone-100 flex items-center justify-center text-rose-700">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Consultative Approach</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We review your hair and skin history before every appointment to recommend the most appropriate regimen.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-stone-100 flex items-center justify-center text-rose-700">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Clean Products</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We use salon-grade, dermatologically tested formulas free from harsh sulfates and parabens.
          </p>
        </div>
      </div>

      {/* Meet Our Artists */}
      <div className="space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
            Styling Team
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Our Salon Specialists
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-stone-200 p-6 space-y-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center text-white font-serif text-xl font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-900">{member.name}</h3>
                <p className="text-xs text-rose-700 font-semibold">{member.role}</p>
                <p className="text-xs text-stone-500 mt-0.5">{member.experience}</p>
              </div>
              <p className="text-xs text-stone-600 border-t border-stone-100 pt-3 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
