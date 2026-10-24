import SEO from '../components/common/SEO';
import BridalShowcase from '../components/bridal/BridalShowcase';

export default function Bridal() {
  return (
    <div className="pt-2 sm:pt-4">
      <SEO
        title="Royal Bridal Makeup Studio Sikar | Enrich Beauty Parlour"
        description="Experience luxury bridal transformations by Lead Cosmetologist Anu Saini at Enrich Sikar. HD Airbrush, Traditional Rajasthani poshak draping, 18-hr waterproof makeup. Book on WhatsApp."
        url="/bridal"
      />
      <BridalShowcase isEmbedded={false} />
    </div>
  );
}
