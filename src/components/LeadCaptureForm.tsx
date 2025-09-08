import { useState, useEffect } from 'react';
import { Mail, User, CheckCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateLeadForm, ValidationError } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { useLeadStore } from '@/lib/lead-store';

export const LeadCaptureForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', industry: '' });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { submitted, sessionLeads, setSubmitted, addLead } = useLeadStore();

  useEffect(() => {
    setSubmitted(false);
  }, []);
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLeadForm(formData);
    setValidationErrors(errors);

    if (errors.length === 0) {
      try {
        // Save to database first
        const { data: leadData, error: dbError } = await supabase
          .from('leads')
          .insert({
            name: formData.name,
            email: formData.email,
            industry: formData.industry,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving lead to database:', dbError);
          throw dbError;
        }

        console.log('Lead saved to database successfully:', leadData);

        // Send confirmation email
        const { error: emailError } = await supabase.functions.invoke('send-confirmation', {
          body: {
            name: formData.name,
            email: formData.email,
            industry: formData.industry,
          },
        });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't throw here - we still want to show success even if email fails
        } else {
          console.log('Confirmation email sent successfully');
        }

        const lead = {
          name: formData.name,
          email: formData.email,
          industry: formData.industry,
          submitted_at: new Date().toISOString(),
        };
        addLead(lead);
        setSubmitted(true);
        setFormData({ name: '', email: '', industry: '' });
      } catch (error) {
        console.error('Error processing form submission:', error);
        // TODO: Show error message to user
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors.some(error => error.field === field)) {
      setValidationErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow animate-glow">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3">Welcome aboard! 🎉</h2>

          <p className="text-muted-foreground mb-2">
            Thanks for joining! We'll be in touch soon with updates.
          </p>

          <p className="text-sm text-accent mb-8">
            You're #{sessionLeads.length} in this session
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-foreground">
                💡 <strong>What's next?</strong>
                <br />
                We'll send you exclusive updates, early access, and behind-the-scenes content as we
                build something amazing.
              </p>
            </div>

            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full border-border hover:bg-accent/10 transition-smooth group"
            >
              Submit Another Lead
              <User className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Follow our journey on social media for real-time updates
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border backdrop-blur-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Join Our Community</h2>
          <p className="text-muted-foreground">Be the first to know when we launch</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground transition-smooth
                  ${getFieldError('name') ? 'border-destructive' : 'focus:border-accent focus:shadow-glow'}
                `}
              />
            </div>
            {getFieldError('name') && (
              <p className="text-destructive text-sm animate-fade-in">{getFieldError('name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground transition-smooth
                  ${getFieldError('email') ? 'border-destructive' : 'focus:border-accent focus:shadow-glow'}
                `}
              />
            </div>
            {getFieldError('email') && (
              <p className="text-destructive text-sm animate-fade-in">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className={`pl-10 h-12 bg-input border-border text-foreground transition-smooth
                  ${getFieldError('industry') ? 'border-destructive' : 'focus:border-accent focus:shadow-glow'}
                `}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail & E-commerce</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {getFieldError('industry') && (
              <p className="text-destructive text-sm animate-fade-in">{getFieldError('industry')}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-[0_0_60px_hsl(210_100%_60%/0.3)] transition-smooth transform hover:scale-[1.02]"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Get Early Access
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By submitting, you agree to receive updates. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};
